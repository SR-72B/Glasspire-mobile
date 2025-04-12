import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, User, LogOut, Home, FileText, CreditCard, Settings, MessageSquare } from "lucide-react";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();
  
  const handleLogout = async () => {
    await fine.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          {session?.user && isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <SheetHeader>
                  <SheetTitle>GlassSpire Mobile</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-3">
                  <Button variant="ghost" className="justify-start" onClick={() => navigate("/dashboard")}>
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => navigate("/orders")}>
                    <FileText className="mr-2 h-5 w-5" />
                    Orders
                  </Button>
                  <Button variant="ghost" className="justify-start" onClick={() => navigate("/messages")}>
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Messages
                  </Button>
                  {session?.user && (
                    <Button variant="ghost" className="justify-start" onClick={() => navigate("/subscription")}>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Subscription
                    </Button>
                  )}
                  <Button variant="ghost" className="justify-start" onClick={() => navigate("/account")}>
                    <Settings className="mr-2 h-5 w-5" />
                    Account
                  </Button>
                  <Button variant="ghost" className="justify-start text-red-500" onClick={handleLogout}>
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center gap-2">
            <div className="relative h-7 w-7 overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
              <div className="absolute inset-1 rounded-full bg-white opacity-50"></div>
            </div>
            <span className="text-lg font-bold">GlassSpire</span>
          </Link>
        </div>
        
        {session?.user ? (
          <>
            {!isMobile && (
              <nav className="hidden md:flex items-center gap-6">
                <Link to="/dashboard" className="text-sm font-medium hover:underline">
                  Dashboard
                </Link>
                <Link to="/orders" className="text-sm font-medium hover:underline">
                  Orders
                </Link>
                <Link to="/subscription" className="text-sm font-medium hover:underline">
                  Subscription
                </Link>
              </nav>
            )}
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {isMobile && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                        <Home className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/orders")}>
                        <FileText className="mr-2 h-4 w-4" />
                        Orders
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/subscription")}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Subscription
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={() => navigate("/account")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button onClick={() => navigate("/signup")}>Sign Up</Button>
          </div>
        )}
      </div>
    </header>
  );
}