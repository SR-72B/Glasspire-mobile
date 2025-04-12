import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrderForm } from "@/components/glass-order/order-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";

const NewOrderPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-6 flex items-center">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Create New Glass Order</h1>
            <p className="mt-2 text-muted-foreground">
              Fill out the form below to place your custom glass order
            </p>
          </div>
          
          <OrderForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedNewOrderPage = () => (
  <ProtectedRoute Component={NewOrderPage} />
);

export default ProtectedNewOrderPage;