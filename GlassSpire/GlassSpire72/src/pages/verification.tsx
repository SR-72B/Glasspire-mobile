import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VerificationPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false);
        return;
      }

      try {
        // Verify the email with Fine auth
        await fine.auth.verifyEmail(token);
        
        // Update user verification status in our database
        const session = await fine.auth.getSession();
        if (session?.data?.user?.id) {
          await fine.table("users")
            .update({ 
              verificationStatus: "verified",
              updatedAt: new Date().toISOString()
            })
            .eq("id", parseInt(session.data.user.id));
        }
        
        setVerified(true);
        toast({
          title: "Email verified",
          description: "Your email has been verified successfully.",
        });
      } catch (error) {
        console.error("Error verifying email:", error);
        toast({
          title: "Verification failed",
          description: "There was an error verifying your email. Please try again.",
          variant: "destructive",
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [token, toast]);

  return (
    <div className="container mx-auto flex h-screen items-center justify-center py-10">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Email Verification</CardTitle>
          <CardDescription>
            {verifying
              ? "Verifying your email address..."
              : verified
              ? "Your email has been verified"
              : "Email verification failed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {verifying ? (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          ) : verified ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          
          <p className="mt-6 text-center text-muted-foreground">
            {verifying
              ? "Please wait while we verify your email address..."
              : verified
              ? "Thank you for verifying your email address. You can now access all features of the application."
              : "We couldn't verify your email address. The verification link may have expired or is invalid."}
          </p>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => navigate(verified ? "/dashboard" : "/login")}
            disabled={verifying}
          >
            {verified ? "Go to Dashboard" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerificationPage;