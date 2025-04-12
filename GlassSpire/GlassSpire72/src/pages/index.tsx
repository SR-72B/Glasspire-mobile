import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { fine } from "@/lib/fine";
import { Smartphone, Tablet, Check } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { data: session } = fine.auth.useSession();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white py-16 md:py-24">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="h-full w-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          <div className="container relative z-10 mx-auto px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 md:gap-16">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                    Glass Order Management in Your Pocket
                  </h1>
                  <p className="text-muted-foreground md:text-xl">
                    Track your custom glass orders from anywhere with our cross-platform mobile app for both customers and retailers.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  {session?.user ? (
                    <Button size="lg" onClick={() => navigate("/dashboard")}>
                      Go to Dashboard
                    </Button>
                  ) : (
                    <>
                      <Button size="lg" onClick={() => navigate("/signup")}>
                        Get Started
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => navigate("/login")}>
                        Sign In
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>iOS</span>
                  <span className="mx-1">•</span>
                  <Tablet className="h-4 w-4" />
                  <span>Android</span>
                  <span className="mx-1">•</span>
                  <span>Web</span>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative mx-auto w-[280px]">
                  <div className="absolute -top-6 -left-6 h-40 w-40 rounded-full bg-blue-100"></div>
                  <div className="absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-blue-100"></div>
                  <div className="relative z-10 overflow-hidden rounded-[3rem] border-[8px] border-black bg-white shadow-xl">
                    <div className="absolute top-0 left-1/2 h-6 w-24 -translate-x-1/2 rounded-b-xl bg-black"></div>
                    <div className="h-[500px] w-full overflow-hidden">
                      <div className="flex h-full flex-col">
                        <div className="bg-blue-500 p-4 text-white">
                          <div className="text-lg font-bold">GlassSpire Mobile</div>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="mb-4 h-32 rounded-lg bg-blue-100 p-4">
                            <div className="h-4 w-3/4 rounded-full bg-blue-200"></div>
                            <div className="mt-2 h-3 w-1/2 rounded-full bg-blue-200"></div>
                            <div className="mt-4 flex justify-between">
                              <div className="h-8 w-16 rounded-md bg-blue-500"></div>
                              <div className="h-8 w-8 rounded-full bg-blue-300"></div>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-12 rounded-md bg-gray-100"></div>
                            <div className="h-12 rounded-md bg-gray-100"></div>
                            <div className="h-12 rounded-md bg-gray-100"></div>
                          </div>
                        </div>
                        <div className="flex border-t bg-gray-50 p-2">
                          <div className="flex-1 flex justify-center items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-200"></div>
                          </div>
                          <div className="flex-1 flex justify-center items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-200"></div>
                          </div>
                          <div className="flex-1 flex justify-center items-center">
                            <div className="h-6 w-6 rounded-full bg-blue-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Mobile-First Features
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to manage glass orders on the go
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-600"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Dual Account Types</h3>
                <p className="mt-2 text-muted-foreground">
                  Free for customers, subscription for retailers
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-600"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <line x1="10" y1="9" x2="8" y2="9"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Mobile Order Forms</h3>
                <p className="mt-2 text-muted-foreground">
                  Create and submit glass orders from your mobile device
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-blue-100 p-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-blue-600"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Real-time Tracking</h3>
                <p className="mt-2 text-muted-foreground">
                  Get push notifications as your order progresses
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-white py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Simple Pricing
              </h2>
              <p className="mx-auto mt-4 max-w-[700px] text-muted-foreground md:text-xl">
                Choose the plan that works for you
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:max-w-4xl lg:mx-auto">
              {/* Customer Plan */}
              <div className="flex flex-col rounded-lg border shadow-sm">
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Customer</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold">Free</span>
                    <span className="ml-1 text-xl font-semibold text-muted-foreground">forever</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    For individuals ordering custom glass products
                  </p>
                </div>
                <div className="flex flex-1 flex-col justify-between rounded-b-lg bg-muted/50 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Create and track glass orders</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Upload reference images</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Real-time order status updates</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Communication with retailers</span>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button className="w-full" onClick={() => navigate("/signup")}>
                      Sign up for free
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Retailer Plan */}
              <div className="relative flex flex-col rounded-lg border border-primary shadow-sm">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-sm font-semibold text-primary-foreground">
                  Popular
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold">Retailer</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-extrabold">$20</span>
                    <span className="ml-1 text-xl font-semibold text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-4 text-muted-foreground">
                    For businesses managing customer glass orders
                  </p>
                </div>
                <div className="flex flex-1 flex-col justify-between rounded-b-lg bg-muted/50 p-6">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Manage all customer orders</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Update order status</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Customer communication tools</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-6 w-6 flex-shrink-0 text-green-500" />
                      <span className="ml-3 text-base">Business analytics</span>
                    </li>
                  </ul>
                  <div className="mt-8">
                    <Button className="w-full" onClick={() => navigate("/signup")}>
                      Start free trial
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-blue-50 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to streamline your glass orders?
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Download the GlassSpire mobile app today and experience the difference.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" onClick={() => navigate("/signup")}>
                  Get Started
                </Button>
                <Button variant="outline" size="lg" onClick={() => navigate("/contact")}>
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Index;