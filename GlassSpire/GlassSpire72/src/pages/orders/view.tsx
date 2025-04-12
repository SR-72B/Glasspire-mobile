import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { OrderStatus } from "@/components/glass-order/order-status";
import { fine } from "@/lib/fine";
import { ProtectedRoute } from "@/components/auth/route-components";

const ViewOrderPage = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6">
          <OrderStatus />
        </div>
      </main>
      <Footer />
    </div>
  );
};

const ProtectedViewOrderPage = () => (
  <ProtectedRoute Component={ViewOrderPage} />
);

export default ProtectedViewOrderPage;