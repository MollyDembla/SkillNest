import React from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ChatProvider } from "./context/ChatContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/layout/Navbar";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";

function AppChrome() {
  const location = useLocation();
  const hideNav =
    location.pathname.startsWith("/auth") ||
    location.pathname.startsWith("/verify-email") ||
    location.pathname.startsWith("/learn/");

  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNav ? <Navbar /> : null}
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ChatProvider>
            <NotificationProvider>
            <AppChrome />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  borderRadius: "14px",
                  fontWeight: 600,
                  fontSize: "14px",
                },
              }}
            />
            </NotificationProvider>
            </ChatProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
