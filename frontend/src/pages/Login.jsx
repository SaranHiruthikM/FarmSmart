import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, Phone, Lock, ArrowRight, Loader2 } from "lucide-react";
import authService from "../services/auth.service";
import LanguageSelector from "../components/common/LanguageSelector";
import loginImage from "../assets/Images/loginPageImage.jpg";

const Login = () => {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  // Backend doesn't require role for login, but frontend has it in state. 
  // We'll keep it to avoid UI changes, even if unused in API call or maybe passed if backend supports it later.
  const [role, setRole] = useState("farmer"); 
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.login({
        phoneNumber: phone,
        password: password
      });
      
      // Navigate to OTP page instead of Dashboard, passing phone number
      navigate("/otp", { state: { phoneNumber: phone } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid credentials. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Side - Branding (Green) with Image Background */}
      <div className="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between p-12 text-white overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={loginImage}
            alt="FarmSmart Background"
            className="w-full h-full object-cover"
          />
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-primary/60 mix-blend-multiply"></div>
        </div>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">FarmSmart</h1>
        </div>

        {/* Middle Content - optional text or just empty spacer if they want pure image */}
        <div className="relative z-10">
          {/* Keeping it empty to let the image shine, or we could restore slogan if requested */}
        </div>

        {/* Bottom: Copyright */}
        <div className="relative z-10 text-sm text-white/80 font-medium">
          © 2026 FarmSmart Inc.
        </div>
      </div>

      {/* Right Side - Form (White) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 bg-white text-text-dark relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-text-dark">Welcome Back</h2>
            <p className="mt-2 text-accent">Please sign in to your account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-secondary-light/20 border border-secondary text-secondary text-sm flex items-center font-medium"
              >
                <span className="mr-2">⚠️</span> {error}
              </motion.div>
            )}

            <div className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">I am a</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-accent/20 bg-neutral-light">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${role === "farmer"
                      ? "bg-white text-primary shadow-sm"
                      : "text-accent hover:text-text-dark"
                      }`}
                  >
                    Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${role === "buyer"
                      ? "bg-white text-primary shadow-sm"
                      : "text-accent hover:text-text-dark"
                      }`}
                  >
                    Buyer
                  </button>
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">Phone Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5 ml-1">
                  <label className="block text-sm font-semibold text-text-dark">Password</label>
                  <a href="#" className="text-xs font-semibold text-primary hover:text-primary-light transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">Language</label>
                <LanguageSelector />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </motion.button>

            <div className="text-center mt-6">
              <p className="text-sm text-accent">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-primary hover:text-primary-dark hover:underline transition-all">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
