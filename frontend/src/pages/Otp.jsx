import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

import OTPInput from "../components/common/OTPInput";
import PrimaryButton from "../components/common/PrimaryButton";
import AuthCard from "../components/common/AuthCard";
import authService from "../services/auth.service";

function Otp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
        // If someone comes here directly without phone number, send them back to login
        navigate("/login");
    }
  }, [phoneNumber, navigate]);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
        await authService.verify({
            contact: phoneNumber,
            code: otp
        });
        
        // Success: Token stored in authService.verify
        navigate("/dashboard");
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Invalid OTP");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">

      <AuthCard title="OTP Verification">
        
        <p className="text-sm text-gray-500 text-center mb-6">
            Enter the 6-digit code sent to <br/> 
            <span className="font-semibold text-gray-800">{phoneNumber}</span>
        </p>

        {error && (
            <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded border border-red-200">
                {error}
            </div>
        )}

        <OTPInput
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <div className="mt-6">
          <PrimaryButton onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </PrimaryButton>
        </div>
        
        {/* Helper for demo since no real SMS */}
        <p className="text-xs text-center text-gray-400 mt-4">
            (Check backend console for OTP code)
        </p>

      </AuthCard>

    </div>
  );
}

export default Otp;
