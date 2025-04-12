import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SubscriptionForm } from "@/components/payment/subscription-form";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import type { Schema } from "@/lib/db-types";

type User = Schema["users"] & { id: number };

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) return;
      
      try {
        // Fetch user data
        const userData = await fine.table("users")
          .select()
          .eq("id", parseInt(session.user.id));
        
        if (userData && userData.length > 0) {
          setUser(userData[0] as User);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Subscription Management</h1>
            <p className="mt-2 text-muted-foreground">
              {user?.accountType === 'retailer' 
                ? 'Manage your retailer subscription plan and payment details' 
                : 'Subscription information'}
            </p>
          </div>
          
          {user?.accountType === 'customer' ? (
            <div className="space-y-6">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Free Account</AlertTitle>
                <AlertDescription>
                  As a customer, you have a free account with access to all customer features.
                  No subscription is required.
                </AlertDescription>
              </Alert>
              
              <Button onClick={() => navigate("/dashboard")}>
                Return to Dashboard
              </Button>
            </div>
          ) : (
            <SubscriptionForm />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedSubscriptionPage = () => (
  <ProtectedRoute Component={SubscriptionPage} />
);

export default ProtectedSubscriptionPage;