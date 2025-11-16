import { useEffect } from "react";
import { StatusBar, Style } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Categories from "./pages/Categories";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";
import Offers from "./pages/Offers";
import AdminStock from "./pages/AdminStock";
import AdminOrders from "./pages/AdminOrders";
import AdminWarehouses from "./pages/AdminWarehouses";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Initialize StatusBar for mobile apps
  useEffect(() => {
    const initStatusBar = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          // Show status bar first
          await StatusBar.show();
          // Set dark icons/text (visible on light backgrounds)
          await StatusBar.setStyle({ style: Style.Light });
          // Set white background
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
          // Don't overlay webview (status bar takes its own space)
          await StatusBar.setOverlaysWebView({ overlay: false });
        } catch (error) {
          console.log('StatusBar not available:', error);
        }
      }
    };
    initStatusBar();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/track/:orderId" element={<TrackOrder />} />
              <Route path="/offers" element={<Offers />} />
              <Route
                path="/admin/stock"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/warehouses"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminWarehouses />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
