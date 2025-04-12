import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, MessageSquare } from "lucide-react";
import type { Schema } from "@/lib/db-types";

type Order = Schema["orders"] & { id: number };
type OrderDetails = Schema["orderDetails"] & { id: number };
type User = Schema["users"] & { id: number };

export function OrderStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [customer, setCustomer] = useState<User | null>(null);
  const [retailer, setRetailer] = useState<User | null>(null);
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!id) return;
      
      try {
        // Fetch order
        const orderData = await fine.table("orders")
          .select()
          .eq("id", parseInt(id));
        
        if (orderData && orderData.length > 0) {
          setOrder(orderData[0] as Order);
          
          // Fetch order details
          const detailsData = await fine.table("orderDetails")
            .select()
            .eq("orderId", orderData[0].id);
          
          if (detailsData && detailsData.length > 0) {
            setOrderDetails(detailsData[0] as OrderDetails);
          }
          
          // Fetch customer
          const customerData = await fine.table("users")
            .select()
            .eq("id", orderData[0].customerId);
          
          if (customerData && customerData.length > 0) {
            setCustomer(customerData[0] as User);
          }
          
          // Fetch retailer if assigned
          if (orderData[0].retailerId) {
            const retailerData = await fine.table("users")
              .select()
              .eq("id", orderData[0].retailerId);
            
            if (retailerData && retailerData.length > 0) {
              setRetailer(retailerData[0] as User);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderData();
  }, [id]);

  const handleUpdateStatus = async (newStatus: "received" | "cut" | "tempered" | "ready") => {
    if (!order) return;
    
    try {
      await fine.table("orders")
        .update({ status: newStatus, updatedAt: new Date().toISOString() })
        .eq("id", order.id);
      
      setOrder({ ...order, status: newStatus, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
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
      case "received": return "Mark as Cut";
      case "cut": return "Mark as Tempered";
      case "tempered": return "Mark as Ready";
      default: return "Ready for Pickup";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "received": return "secondary";
      case "cut": return "outline";
      case "tempered": return "secondary";
      case "ready": return "default";
      default: return "secondary";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "received": return "Order Received";
      case "cut": return "Glass Cut";
      case "tempered": return "Glass Tempered";
      case "ready": return "Ready for Pickup";
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order || !orderDetails) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-xl font-medium">Order not found</h3>
          <p className="mt-2 text-center text-muted-foreground">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button className="mt-6" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCustomer = session?.user?.id && parseInt(session.user.id) === order.customerId;
  const isRetailer = session?.user?.id && (
    (order.retailerId && parseInt(session.user.id) === order.retailerId) || 
    (session?.user && !isCustomer)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Badge variant={getStatusBadgeVariant(order.status!)}>
          {getStatusLabel(order.status!)}
        </Badge>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription>
                Created on {new Date(order.createdAt!).toLocaleDateString()}
              </CardDescription>
            </div>
            {isRetailer && order.status !== "ready" && (
              <Button onClick={() => handleUpdateStatus(getNextStatus(order.status!))}>
                {getNextStatusLabel(order.status!)}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Glass Specifications</h3>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Thickness:</div>
                  <div>{orderDetails.glassThickness}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Finish:</div>
                  <div>{orderDetails.glassFinish.replace('_', ' ')}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Tempering:</div>
                  <div>{orderDetails.tempering ? "Yes" : "No"}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">DFI Coating:</div>
                  <div>{orderDetails.dfiCoating ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Dimensions</h3>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Width:</div>
                  <div>{orderDetails.width} inches</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Height:</div>
                  <div>{orderDetails.height} inches</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Quantity:</div>
                  <div>{orderDetails.quantity}</div>
                </div>
              </div>
            </div>
          </div>
          
          {orderDetails.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Additional Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{orderDetails.notes}</p>
            </div>
          )}
          
          {orderDetails.imageUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Reference Image</h3>
              <div className="mt-2 overflow-hidden rounded-md border">
                <img src={orderDetails.imageUrl} alt="Order reference" className="h-auto max-h-64 w-full object-contain" />
              </div>
            </div>
          )}
          
          <Separator className="my-6" />
          
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Customer Information</h3>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Name:</div>
                  <div>{customer?.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Email:</div>
                  <div>{customer?.email}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Order Status</h3>
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${order.status === "received" || order.status === "cut" || order.status === "tempered" || order.status === "ready" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <div className={order.status === "received" || order.status === "cut" || order.status === "tempered" || order.status === "ready" ? "font-medium" : "text-muted-foreground"}>
                    Order Received
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${order.status === "cut" || order.status === "tempered" || order.status === "ready" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <div className={order.status === "cut" || order.status === "tempered" || order.status === "ready" ? "font-medium" : "text-muted-foreground"}>
                    Glass Cut
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${order.status === "tempered" || order.status === "ready" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <div className={order.status === "tempered" || order.status === "ready" ? "font-medium" : "text-muted-foreground"}>
                    Glass Tempered
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${order.status === "ready" ? "bg-green-500" : "bg-gray-300"}`}></div>
                  <div className={order.status === "ready" ? "font-medium" : "text-muted-foreground"}>
                    Ready for Pickup
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate("/messages")}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact {isCustomer ? "Retailer" : "Customer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}