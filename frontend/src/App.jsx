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
import SchemesPage from "./pages/SchemesPage";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NegotiationHistory from "./pages/NegotiationHistory";
import NegotiationDetail from "./pages/NegotiationDetail";
import OrderHistory from "./pages/orders/OrderHistory";
import OrderSummary from "./pages/orders/OrderSummary";
import OrderStatus from "./pages/orders/OrderStatus";
import ReviewsAndTrust from "./pages/ReviewsAndTrust";
import MyDisputes from "./pages/orders/MyDisputes";
import DisputeDetails from "./pages/orders/DisputeDetails";
import AdminDisputes from "./pages/admin/AdminDisputes";
import SalesRevenue from "./pages/SalesRevenue";

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

        {/* Negotiation & Bidding */}
        <Route path="negotiation" element={<NegotiationHistory />} />
        <Route path="negotiations/:id" element={<NegotiationDetail />} />

        {/* Farmer Crop Management */}
        <Route path="add-crop" element={<CropListingForm />} />
        <Route path="my-crops/edit/:id" element={<CropListingForm />} />

        {/* Government Schemes */}
        <Route path="schemes" element={<SchemesPage />} />
        {/* Notifications & Settings */}
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        {/* Orders */}
        <Route path="orders" element={<OrderHistory />} />
        <Route path="orders/summary/:negotiationId" element={<OrderSummary />} />
        <Route path="orders/:orderId" element={<OrderStatus />} />

        {/* Sales & Revenue (Farmer Only) */}
        <Route path="sales" element={<SalesRevenue />} />

        {/* Reviews & Trust */}
        <Route path="reviews" element={<ReviewsAndTrust />} />

        {/* Disputes */}
        <Route path="disputes" element={<MyDisputes />} />
        <Route path="disputes/:id" element={<DisputeDetails />} />

        {/* Admin Disputes */}
        <Route path="admin/disputes" element={<AdminDisputes />} />
        <Route path="admin/disputes/:id" element={<AdminDisputes />} />

        {/* Fallback for dashboard */}
        <Route path="*" element={<div className="p-10 text-center text-gray-500">Page under construction</div>} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
