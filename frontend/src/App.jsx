import { Routes, Route, Navigate } from "react-router-dom";
import authService from "./services/auth.service";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Otp from "./pages/Otp";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import CropDetails from "./pages/CropDetails";
import CropListingForm from "./pages/CropListingForm";
import PriceInsights from "./pages/PriceInsights";
import DemandForecast from "./pages/DemandForecast";
import QualityPricing from "./pages/QualityPricing";
import OrderHistory from "./pages/orders/OrderHistory";
import OrderSummary from "./pages/orders/OrderSummary";
import OrderStatus from "./pages/orders/OrderStatus";

// Protected Route Wrapper for Public Pages (Login/Register)
// If authenticated, redirect to dashboard.
const PublicRoute = ({ children }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/otp" element={<PublicRoute><Otp /></PublicRoute>} />

      {/* Dashboard Routes */}
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        {/* Marketplace */}
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="marketplace/:id" element={<CropDetails />} />

        {/* Price Insights */}
        <Route path="insights" element={<PriceInsights />} />

        {/* Demand Forecast */}
        <Route path="forecast" element={<DemandForecast />} />

        {/* Quality Based Pricing */}
        <Route path="pricing" element={<QualityPricing />} />

        {/* Farmer Crop Management */}
        <Route path="add-crop" element={<CropListingForm />} />
        <Route path="my-crops/edit/:id" element={<CropListingForm />} />

        {/* Orders */}
        <Route path="orders" element={<OrderHistory />} />
        <Route path="orders/summary/:negotiationId" element={<OrderSummary />} />
        <Route path="orders/:orderId" element={<OrderStatus />} />

        {/* Fallback for dashboard */}
        <Route path="*" element={<div className="p-10 text-center text-gray-500">Page under construction</div>} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
