import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Store from "./pages/Store.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SellerSignup from "./pages/SellerSignup.jsx";
import SellerLogin from "./pages/SellerLogin.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Store />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/seller/signup" element={<SellerSignup />} />
        <Route path="/seller/login" element={<SellerLogin />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
