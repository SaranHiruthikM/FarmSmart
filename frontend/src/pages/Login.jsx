import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Leaf, Phone, Lock, ArrowRight, Loader2, ShieldAlert } from "lucide-react";
import authService from "../services/auth.service";
import LanguageSelector from "../components/common/LanguageSelector";
import loginImage from "../assets/Images/loginPageImage.jpg";


const Login = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useTranslation();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError(t('common.fillRequired'));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.login({
        phoneNumber: phone,
        password: password
      });

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('auth.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-nature-50">
      {/* Background with Image and Overlay */}
      <div className="absolute inset-0 z-0">
        <img
            src={loginImage}
            alt="FarmSmart Background"
            className="w-full h-full object-cover scale-105 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-nature-900/80 to-nature-800/60 mix-blend-multiply"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-nature-400 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-light rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse-slow"></div>
      </div>

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[2.5rem] overflow-hidden glass-panel shadow-2xl relative z-10 mx-auto min-h-[600px]"
      >
        
        {/* Left Side (Branding) */}
        <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-nature-900/40 backdrop-blur-md border-r border-white/10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-nature-950/60"></div>
            
            {/* Logo */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-lg border border-white/10">
                        <Leaf className="w-8 h-8 text-nature-100" />
                    </div>
                </div>
                <h1 className="text-5xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
                    Farm<span className="text-nature-300">Smart</span>
                </h1>
                <p className="mt-4 text-nature-100 text-lg max-w-sm font-medium leading-relaxed drop-shadow-md">
                    Cultivating a smarter future for agriculture through technology and community.
                </p>
            </div>

            {/* Quote Card */}
            <div className="relative z-10 mt-auto">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-lg transform hover:-translate-y-1 transition-transform duration-300">
                    <p className="text-white/90 text-sm italic font-medium leading-relaxed">
                        "Agriculture is the most healthful, most useful and most noble employment of man."
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                        <div className="w-6 h-0.5 bg-nature-300 rounded-full"></div>
                        <span className="text-nature-200 text-xs uppercase tracking-wider font-bold">George Washington</span>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <Link to="/admin-login" className="text-sm font-semibold text-nature-300 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Cooperative Official Access
                    </Link>
                </div>
            </div>
        </div>

        {/* Right Side (Auth Form) */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-8 md:p-12 bg-white/80 backdrop-blur-xl relative">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8">
                    <div className="lg:hidden flex justify-center mb-4">
                        <div className="bg-gradient-to-br from-nature-500 to-nature-700 p-3 rounded-2xl shadow-lg shadow-nature-500/30 text-white">
                            <Leaf className="w-8 h-8" />
                        </div>
                    </div>
                    <h2 className="text-3xl font-black text-nature-900 tracking-tight">Welcome Back</h2>
                    <p className="mt-2 text-nature-600 font-medium text-sm">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Error Display */}
                    <AnimatePresence>
                        {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: -10 }}
                            animate={{ opacity: 1, height: "auto", y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl flex items-start gap-3 shadow-sm"
                        >
                            <span className="mt-0.5 font-bold">!</span>
                            <span className="font-medium leading-snug">{error}</span>
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Phone Input */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-nature-700 ml-1 uppercase tracking-wide">Phone Number</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-400 group-focus-within:text-nature-600 transition-colors duration-300">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input
                                type="tel"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                            />
                        </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="flex justify-between items-center ml-1">
                            <label className="text-xs font-bold text-nature-700 uppercase tracking-wide">Password</label>
                            <Link to="/forgot-password" className="text-xs font-bold text-nature-600 hover:text-nature-800 transition-colors">
                                Forgot Password?
                            </Link>
                        </div>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-nature-400 group-focus-within:text-nature-600 transition-colors duration-300">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-nature-600 to-nature-500 hover:from-nature-700 hover:to-nature-600 text-white font-bold text-lg shadow-lg shadow-nature-500/30 hover:shadow-nature-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Verifying...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign In Account</span>
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                    
                    {/* Language Selector */}
                    <div className="flex justify-center mt-4">
                        <div className="bg-nature-50 rounded-lg p-1 border border-nature-100">
                            <LanguageSelector />
                        </div>
                    </div>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-nature-600 font-medium text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="font-bold text-nature-800 hover:text-nature-900 underline decoration-2 decoration-nature-400 hover:decoration-nature-600 underline-offset-4 transition-all">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
      </motion.div>
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-white/60 text-xs font-medium">© 2026 FarmSmart. Designed for Growth.</p>
      </div>
    </div>
  );
};

export default Login;
