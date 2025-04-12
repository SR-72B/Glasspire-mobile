import { useState, useEffect } from "react";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Check } from "lucide-react";
import type { Schema } from "@/lib/db-types";

type User = Schema["users"] & { id: number };

export function SubscriptionForm() {
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<(Schema["subscriptions"] & { id: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          
          // Fetch subscription data
          const subscriptionData = await fine.table("subscriptions")
            .select()
            .eq("userId", parseInt(session.user.id));
          
          if (subscriptionData && subscriptionData.length > 0) {
            setSubscription(subscriptionData[0] as any);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === "cardNumber") {
      const formatted = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim();
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } 
    // Format expiry date with slash
    else if (name === "cardExpiry") {
      const cleaned = value.replace(/\D/g, "");
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
      }
      
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;
    
    // Loop from right to left
    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits.charAt(i));
      
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    
    return sum % 10 === 0;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate card number
    const cardNumber = formData.cardNumber.replace(/\s/g, "");
    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (cardNumber.length < 13 || cardNumber.length > 19) {
      newErrors.cardNumber = "Card number must be between 13 and 19 digits";
    } else if (!/^\d+$/.test(cardNumber)) {
      newErrors.cardNumber = "Card number must contain only digits";
    } else if (!validateLuhn(cardNumber)) {
      newErrors.cardNumber = "Invalid card number";
    }
    
    // Validate expiry date
    const expiryParts = formData.cardExpiry.split("/");
    if (!formData.cardExpiry) {
      newErrors.cardExpiry = "Expiry date is required";
    } else if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      newErrors.cardExpiry = "Expiry date must be in MM/YY format";
    } else {
      const month = parseInt(expiryParts[0]);
      const year = parseInt(`20${expiryParts[1]}`);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      if (month < 1 || month > 12) {
        newErrors.cardExpiry = "Invalid month";
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        newErrors.cardExpiry = "Card has expired";
      }
    }
    
    // Validate CVC
    if (!formData.cardCvc) {
      newErrors.cardCvc = "CVC is required";
    } else if (!/^\d{3,4}$/.test(formData.cardCvc)) {
      newErrors.cardCvc = "CVC must be 3 or 4 digits";
    }
    
    // Validate cardholder name
    if (!formData.cardName) {
      newErrors.cardName = "Cardholder name is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!session?.user?.id || !user) {
      toast({
        title: "Not logged in",
        description: "Please log in to subscribe",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cardLast4 = formData.cardNumber.replace(/\s/g, "").slice(-4);
      
      // Create or update subscription
      if (subscription) {
        await fine.table("subscriptions").update({
          plan: "retailer",
          endDate: calculateEndDate(),
          paymentMethod: "card",
          cardLast4,
        }).eq("id", subscription.id);
        
        setSubscription({
          ...subscription,
          plan: "retailer",
          endDate: calculateEndDate(),
          paymentMethod: "card",
          cardLast4,
        });
      } else {
        const newSubscription = await fine.table("subscriptions").insert({
          userId: parseInt(session.user.id),
          plan: "retailer",
          startDate: new Date().toISOString(),
          endDate: calculateEndDate(),
          paymentMethod: "card",
          cardLast4,
        }).select();
        
        if (newSubscription && newSubscription.length > 0) {
          setSubscription(newSubscription[0] as any);
        }
      }
      
      // Update user subscription status
      await fine.table("users").update({
        subscriptionStatus: "active",
      }).eq("id", parseInt(session.user.id));
      
      setUser({
        ...user,
        subscriptionStatus: "active",
      });
      
      toast({
        title: "Subscription updated",
        description: "Your subscription has been successfully updated",
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Error",
        description: "There was an error updating your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateEndDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // If user is a customer, show a message that they don't need to pay
  if (user?.accountType === 'customer') {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Information</CardTitle>
            <CardDescription>
              Customer accounts are free to use
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-xl font-medium">No Payment Required</h3>
            <p className="mt-2 text-center text-muted-foreground max-w-md">
              As a customer, you can use all features of GlassSpire for free. Only retailers need to subscribe to our service.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Retailer Subscription Plan</CardTitle>
          <CardDescription>
            Subscribe to access retailer features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-between rounded-md border-2 border-primary bg-popover p-4">
            <div className="mb-3 flex w-full items-center justify-between">
              <div className="text-lg font-medium">Retailer Plan</div>
              <div className="text-sm text-muted-foreground">$20/month</div>
            </div>
            <div className="w-full text-sm text-muted-foreground">
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Manage all customer orders
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Update order status
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Customer communication tools
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Business analytics
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
          <CardDescription>
            {subscription
              ? `Your subscription is ${user?.subscriptionStatus}. Current billing period: ${formatDate(subscription.startDate!)} - ${formatDate(subscription.endDate!)}`
              : "Enter your payment details to start your subscription"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input
                id="cardName"
                name="cardName"
                placeholder="John Doe"
                value={formData.cardName}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
              {errors.cardName && <p className="text-sm text-destructive">{errors.cardName}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input
                id="cardNumber"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                maxLength={19}
                disabled={isSubmitting}
              />
              {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cardExpiry">Expiry Date</Label>
                <Input
                  id="cardExpiry"
                  name="cardExpiry"
                  placeholder="MM/YY"
                  value={formData.cardExpiry}
                  onChange={handleInputChange}
                  maxLength={5}
                  disabled={isSubmitting}
                />
                {errors.cardExpiry && <p className="text-sm text-destructive">{errors.cardExpiry}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cardCvc">CVC</Label>
                <Input
                  id="cardCvc"
                  name="cardCvc"
                  placeholder="123"
                  value={formData.cardCvc}
                  onChange={handleInputChange}
                  maxLength={4}
                  disabled={isSubmitting}
                />
                {errors.cardCvc && <p className="text-sm text-destructive">{errors.cardCvc}</p>}
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : subscription ? (
                "Update Payment Method"
              ) : (
                "Start Subscription"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}