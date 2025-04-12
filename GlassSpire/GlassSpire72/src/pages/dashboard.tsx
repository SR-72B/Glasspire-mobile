import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, FileText, CreditCard, MessageSquare } from "lucide-react";
import type { Schema } from "@/lib/db-types";

type User = Schema["users"] & { id: number };
type Order = Schema["orders"] & { id: number };
type OrderWithDetails = Order & { details: Schema["orderDetails"] & { id: number } };

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
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
          
          // Fetch orders based on user type
          let ordersData;
          if (userData[0].accountType === 'customer') {
            ordersData = await fine.table("orders")
              .select()
              .eq("customerId", userData[0].id);
          } else {
            ordersData = await fine.table("orders")
              .select();
          }
          
          // Fetch order details for each order
          if (ordersData && ordersData.length > 0) {
            const ordersWithDetails = await Promise.all(
              ordersData.map(async (order) => {
                const details = await fine.table("orderDetails")
                  .select()
                  .eq("orderId", order.id);
                return { ...order, details: details[0] };
              })
            );
            
            setOrders(ordersWithDetails as OrderWithDetails[]);
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

  const renderCustomerDashboard = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">My Orders</h2>
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-medium">No orders yet</h3>
            <p className="mt-2 text-center text-muted-foreground">
              Create your first glass order to get started
            </p>
            <Button className="mt-6" onClick={() => navigate("/orders/new")}>
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <Badge
                    variant={
                      order.status === "ready"
                        ? "default"
                        : order.status === "tempered"
                        ? "secondary"
                        : order.status === "cut"
                        ? "outline"
                        : "secondary"
                    }
                  >
                    {order.status === "received" ? "Order Received" :
                     order.status === "cut" ? "Glass Cut" :
                     order.status === "tempered" ? "Glass Tempered" :
                     "Ready for Pickup"}
                  </Badge>
                </div>
                <CardDescription>
                  Created on {new Date(order.createdAt!).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-muted-foreground">Glass Type:</div>
                    <div>{order.details.glassFinish}</div>
                    <div className="text-muted-foreground">Thickness:</div>
                    <div>{order.details.glassThickness}</div>
                    <div className="text-muted-foreground">Dimensions:</div>
                    <div>
                      {order.details.width}" × {order.details.height}"
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate(`/orders/${order.id}`)}>
                  View Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderRetailerDashboard = () => {
    // Check if retailer subscription is active
    const isSubscriptionActive = user?.subscriptionStatus === "active";
    
    if (!isSubscriptionActive) {
      return (
        <div className="space-y-8">
          <h2 className="text-3xl font-bold">Retailer Dashboard</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Subscription Required</CardTitle>
              <CardDescription>
                You need an active subscription to access retailer features
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-amber-100 p-3">
                <CreditCard className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="mt-4 text-xl font-medium">Subscription Needed</h3>
              <p className="mt-2 text-center text-muted-foreground max-w-md">
                Your retailer account requires an active subscription to manage customer orders.
                Please subscribe to access all retailer features.
              </p>
              <Button className="mt-6" onClick={() => navigate("/subscription")}>
                Subscribe Now
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold">Order Management</h2>
        
        <Tabs defaultValue="received">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="cut">Cut</TabsTrigger>
            <TabsTrigger value="tempered">Tempered</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
          </TabsList>
          
          {["received", "cut", "tempered", "ready"].map((status) => (
            <TabsContent key={status} value={status}>
              {orders.filter(order => order.status === status).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-xl font-medium">No {status} orders</h3>
                    <p className="mt-2 text-center text-muted-foreground">
                      There are currently no orders in this status
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {orders
                    .filter(order => order.status === status)
                    .map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle>Order #{order.id}</CardTitle>
                            <Badge
                              variant={
                                status === "ready"
                                  ? "default"
                                  : status === "tempered"
                                  ? "secondary"
                                  : status === "cut"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {status === "received" ? "Order Received" :
                               status === "cut" ? "Glass Cut" :
                               status === "tempered" ? "Glass Tempered" :
                               "Ready for Pickup"}
                            </Badge>
                          </div>
                          <CardDescription>
                            Created on {new Date(order.createdAt!).toLocaleDateString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Glass Type:</div>
                              <div>{order.details.glassFinish}</div>
                              <div className="text-muted-foreground">Thickness:</div>
                              <div>{order.details.glassThickness}</div>
                              <div className="text-muted-foreground">Dimensions:</div>
                              <div>
                                {order.details.width}" × {order.details.height}"
                              </div>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                          <Button variant="outline" className="flex-1" onClick={() => navigate(`/orders/${order.id}`)}>
                            View
                          </Button>
                          {status !== "ready" && (
                            <Button className="flex-1" onClick={() => handleUpdateStatus(order.id, getNextStatus(status))}>
                              Mark as {getNextStatusLabel(status)}
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    );
  };

  const getNextStatus = (currentStatus: string): "received" | "cut" | "tempered" | "ready" => {
    switch (currentStatus) {
      case "received": return "cut";
      case "cut": return "tempered";
      case "tempered": return "ready";
      default: return "ready";
    }
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    switch (currentStatus) {
      case "received": return "Cut";
      case "cut": return "Tempered";
      case "tempered": return "Ready";
      default: return "Ready";
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: "received" | "cut" | "tempered" | "ready") => {
    try {
      await fine.table("orders")
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq("id", orderId);
      
      // Refresh orders
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, updatedAt: new Date().toISOString() } 
          : order
      ));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold">Welcome, {user?.name}</h1>
            <p className="mt-2 text-muted-foreground">
              {user?.accountType === 'customer' 
                ? 'Manage your glass orders and track their progress' 
                : 'Manage customer orders and update their status'}
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              {user?.accountType === 'customer' 
                ? renderCustomerDashboard() 
                : renderRetailerDashboard()}
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Account Type</div>
                      <div className="mt-1 font-medium capitalize">
                        {user?.accountType === "customer" ? "Customer (Free)" : "Retailer"}
                      </div>
                    </div>
                    {user?.accountType === "retailer" && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground">Subscription</div>
                        <div className="mt-1 font-medium capitalize">{user?.subscriptionStatus}</div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Member Since</div>
                      <div className="mt-1 font-medium">
                        {user?.createdAt && new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => navigate("/account")}>
                    Manage Account
                  </Button>
                </CardFooter>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {user?.accountType === 'customer' ? (
                    <>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/orders/new")}>
                        <Plus className="mr-2 h-4 w-4" /> New Order
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/messages")}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Messages
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/messages")}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Customer Messages
                      </Button>
                      <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/subscription")}>
                        <CreditCard className="mr-2 h-4 w-4" /> Manage Subscription
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;