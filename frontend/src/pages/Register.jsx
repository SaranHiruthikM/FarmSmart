import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Leaf, User, Phone, Lock, ArrowRight, Loader2, Sprout, MapPin, Home } from "lucide-react";
import authService from "../services/auth.service";
import AuthCard from "../components/common/AuthCard"; // Keeping for reference if needed elsewhere, but not using here.

const Register = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password || !state || !district) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await authService.register({
        fullName: name,
        phoneNumber: phone,
        password: password,
        state,
        district,
        address,
        role: role.toUpperCase(), // Backend expects uppercase Role enum
        // preferredLanguage: 'en' // Defaulting to en, could expand if UI supports it
      });

      // Navigate to OTP page
      navigate("/otp", { state: { phoneNumber: phone } });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      {/* Left Side - Branding (Green) */}
      <div className="hidden lg:flex w-1/2 bg-primary relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
            <Leaf className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">FarmSmart</h1>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-medium border border-white/10 mb-2">
            <Sprout className="w-4 h-4" /> Join our community today
          </div>
          <h2 className="text-5xl font-bold leading-tight">
            Start Your <br />
            <span className="text-primary-light">Growth Journey</span>
          </h2>
          <p className="text-lg text-white/90 font-medium">
            Create an account to access real-time market data, weather insights, and expert farming advice.
          </p>
        </div>

        <div className="relative z-10 flex gap-4 text-sm text-white/80 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-white/30 rounded-full"></div>
            <span>Transparent Pricing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-white/30 rounded-full"></div>
            <span>Direct Access</span>
          </div>
        </div>

        {/* Decorative Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Right Side - Form (White) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 md:px-12 lg:px-20 bg-white text-text-dark relative">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-text-dark">Create Account</h2>
            <p className="mt-2 text-accent">Join thousands of farmers and buyers</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="p-3 rounded-lg bg-secondary-light/20 border border-secondary text-secondary text-sm flex items-center font-medium"
              >
                <span className="mr-2">⚠️</span> {error}
              </motion.div>
            )}



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

            {/* Name Input */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                  placeholder="John Doe"
                />
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
              <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                  placeholder="Create a password"
                />
              </div>
            </div>

            {/* State Input */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">State</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                  placeholder="Enter your state"
                />
              </div>
            </div>

            {/* District Input */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">District</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                  placeholder="Enter your district"
                />
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-sm font-semibold text-text-dark mb-1.5 ml-1">Address (Optional)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Home className="h-5 w-5 text-accent group-focus-within:text-primary transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-accent rounded-xl bg-white placeholder-accent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm font-medium text-text-dark"
                  placeholder="Village, Street, etc."
                />
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
                  Create Account <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </motion.button>

            <div className="text-center mt-6">
              <p className="text-sm text-accent">
                Already have an account?{" "}
                <Link to="/" className="font-bold text-primary hover:text-primary-dark hover:underline transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
