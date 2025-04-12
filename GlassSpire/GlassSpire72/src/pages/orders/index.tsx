import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrderList } from "@/components/glass-order/order-list";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";
import { Loader2 } from "lucide-react";
import type { Schema } from "@/lib/db-types";

const OrdersPage = () => {
  const [userType, setUserType] = useState<"customer" | "retailer" | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchUserType = async () => {
      if (!session?.user?.id) return;
      
      try {
        const userData = await fine.table("users")
          .select()
          .eq("id", parseInt(session.user.id));
        
        if (userData && userData.length > 0) {
          setUserType(userData[0].accountType as "customer" | "retailer");
        }
      } catch (error) {
        console.error("Error fetching user type:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserType();
  }, [session]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          {userType && <OrderList userType={userType} />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedOrdersPage = () => (
  <ProtectedRoute Component={OrdersPage} />
);

export default ProtectedOrdersPage;