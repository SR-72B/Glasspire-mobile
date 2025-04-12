// start the app always with '/' route
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { TooltipProvider } from "./components/ui/tooltip";

import { ThemeProvider } from "./components/layout/theme-provider";
import { registerServiceWorker } from "./service-worker-registration";
import "./index.css";
import Index from "./pages";
import LoginForm from "./pages/login";
import SignupForm from "./pages/signup";
import Logout from "./pages/logout";
import Dashboard from "./pages/dashboard";
import Account from "./pages/account";
import Subscription from "./pages/subscription";
import Messages from "./pages/messages";
import Orders from "./pages/orders";
import NewOrder from "./pages/orders/new";
import ViewOrder from "./pages/orders/view";
import VerificationPage from "./pages/verification";

// Register service worker for PWA capabilities
registerServiceWorker();

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/login' element={<LoginForm />} />
            <Route path='/signup' element={<SignupForm />} />
            <Route path='/logout' element={<Logout />} />
            <Route path='/verification' element={<VerificationPage />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/account' element={<Account />} />
            <Route path='/subscription' element={<Subscription />} />
            <Route path='/messages' element={<Messages />} />
            <Route path='/orders' element={<Orders />} />
            <Route path='/orders/new' element={<NewOrder />} />
            <Route path='/orders/:id' element={<ViewOrder />} />
          </Routes>
        </BrowserRouter>
        <Sonner />
        <Toaster />
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);