import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowLeft, FiRefreshCw, FiCheckCircle } from "react-icons/fi";

import OTPInput from "../components/common/OTPInput";
import PrimaryButton from "../components/common/PrimaryButton";
import authService from "../services/auth.service";
import { motion } from "framer-motion";

function Otp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber;

  useEffect(() => {
    if (!phoneNumber) {
      navigate("/login");
    }
  }, [phoneNumber, navigate]);

  useEffect(() => {
    let interval;
    if (resendTimer > 0 && !canResend) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer, canResend]);

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
        code: otp,
      });

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await authService.resend({ contact: phoneNumber });
      setResendTimer(30);
      setCanResend(false);
      setOtp("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-emerald-50">

      {/* SOPHISTICATED BACKGROUND */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100"
          animate={{
            background: [
              "radial-gradient(circle at 0% 0%, #d1fae5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #ecfdf5 0%, transparent 50%)",
              "radial-gradient(circle at 100% 0%, #d1fae5 0%, transparent 50%), radial-gradient(circle at 0% 100%, #ecfdf5 0%, transparent 50%)",
              "radial-gradient(circle at 0% 0%, #d1fae5 0%, transparent 50%), radial-gradient(circle at 100% 100%, #ecfdf5 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />

        {/* Floating Particles/Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-green-200/20 blur-2xl"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-md px-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Glassmorphism Card */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-3xl bg-white/70 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[3rem] p-8 md:p-12 border border-white/60 relative overflow-hidden"
        >
          {/* Subtle top highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

          {/* Change Number Button - Repositioned to corner */}
          <button
            onClick={() => navigate("/login")}
            className="absolute top-6 left-8 text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:text-emerald-700 transition-all flex items-center group bg-emerald-50/50 px-2 py-1 rounded-lg border border-emerald-100/50"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <FiArrowLeft className="mr-1 group-hover:-translate-x-0.5 transition-transform" />
            Change Number
          </button>

          <motion.div variants={itemVariants} className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-3xl mb-6 shadow-inner">
              <FiCheckCircle className="text-4xl text-green-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-green-900 tracking-tight mb-3">
              Verify OTP
            </h1>
            <div className="text-green-800/70 leading-relaxed font-sans">
              <p>We've sent a 6-digit security code to</p>
              <div className="flex flex-col items-center mt-1">
                <span className="font-bold text-green-900 text-lg">{phoneNumber}</span>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-2xl text-sm flex items-center shadow-sm">
                  <span className="mr-2">⚠️</span>
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div variants={itemVariants} className="space-y-8">
            <OTPInput
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="space-y-4">
              <PrimaryButton
                onClick={handleVerify}
                disabled={loading || otp.length < 6}
                className="w-full h-16 bg-green-600 hover:bg-green-700 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-[0_12px_24px_-8px_rgba(22,101,52,0.4)] hover:shadow-[0_20px_40px_-12px_rgba(22,101,52,0.5)] active:scale-[0.98] transition-all"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {loading ? (
                  <div className="flex items-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-3"
                    >
                      <FiRefreshCw />
                    </motion.div>
                    Verifying...
                  </div>
                ) : (
                  "Verify & Continue"
                )}
              </PrimaryButton>

              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-green-700 font-semibold hover:text-green-800 underline underline-offset-4 hover:decoration-2 transition-all"
                  >
                    Didn't receive the code? Resend
                  </button>
                ) : (
                  <p className="text-green-800/60 text-sm font-medium">
                    Resend code in <span className="text-green-700 font-bold">{resendTimer}s</span>
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-[10px] uppercase tracking-[0.2em] font-bold text-center text-green-800/30 mt-12"
          >
            FarmSmart Secure Verification
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Otp;
