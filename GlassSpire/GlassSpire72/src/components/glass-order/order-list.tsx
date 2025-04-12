import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Plus, FileText } from "lucide-react";
import type { Schema } from "@/lib/db-types";

type Order = Schema["orders"] & { id: number };
type OrderWithDetails = Order & { details: Schema["orderDetails"] & { id: number } };

export function OrderList({ userType }: { userType: "customer" | "retailer" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = fine.auth.useSession();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) return;
      
      try {
        // Fetch orders based on user type
        let ordersData;
        if (userType === "customer") {
          ordersData = await fine.table("orders")
            .select()
            .eq("customerId", parseInt(session.user.id));
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
          setFilteredOrders(ordersWithDetails as OrderWithDetails[]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [session, userType]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredOrders(orders);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = orders.filter((order) => {
        return (
          order.id.toString().includes(query) ||
          order.details.glassFinish.toLowerCase().includes(query) ||
          order.details.glassThickness.toLowerCase().includes(query)
        );
      });
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  const renderCustomerOrderList = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Orders</h2>
        <Button onClick={() => navigate("/orders/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Order
        </Button>
      </div>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-medium">No orders found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              {orders.length === 0
                ? "You haven't placed any orders yet"
                : "No orders match your search criteria"}
            </p>
            {orders.length === 0 && (
              <Button className="mt-6" onClick={() => navigate("/orders/new")}>
                <Plus className="mr-2 h-4 w-4" /> Create Order
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle>Order #{order.id}</CardTitle>
                  <Badge variant={getStatusBadgeVariant(order.status!)}>
                    {getStatusLabel(order.status!)}
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
                    <div>{order.details.glassFinish.replace('_', ' ')}</div>
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

  const renderRetailerOrderList = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Order Management</h2>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search orders..."
          className="pl-10"
          value={searchQuery}
          onChange={handleSearch}
        />
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="received">Received</TabsTrigger>
          <TabsTrigger value="cut">Cut</TabsTrigger>
          <TabsTrigger value="tempered">Tempered</TabsTrigger>
          <TabsTrigger value="ready">Ready</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {renderOrdersGrid(filteredOrders)}
        </TabsContent>
        
        {["received", "cut", "tempered", "ready"].map((status) => (
          <TabsContent key={status} value={status}>
            {renderOrdersGrid(filteredOrders.filter(order => order.status === status))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );

  const renderOrdersGrid = (ordersToRender: OrderWithDetails[]) => {
    if (ordersToRender.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-xl font-medium">No orders found</h3>
            <p className="mt-2 text-center text-muted-foreground">
              {orders.length === 0
                ? "There are no orders in the system"
                : "No orders match your search criteria"}
            </p>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ordersToRender.map((order) => (
          <Card key={order.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Order #{order.id}</CardTitle>
                <Badge variant={getStatusBadgeVariant(order.status!)}>
                  {getStatusLabel(order.status!)}
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
                  <div>{order.details.glassFinish.replace('_', ' ')}</div>
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
    );
  };

  return userType === "customer" ? renderCustomerOrderList() : renderRetailerOrderList();
}