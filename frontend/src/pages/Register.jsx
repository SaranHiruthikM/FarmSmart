import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Leaf, User, Phone, Lock, ArrowRight, Loader2, Sprout, MapPin, Home, Languages } from "lucide-react";
import authService from "../services/auth.service";// Keeping for reference if needed elsewhere, but not using here.
import { useState } from "react";
const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("farmer");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preferredLanguage] = useState("en");

  const { t } = useTranslation();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !phone || !password || !state || !district) {
      setError(t('common.fillRequired'));
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
        preferredLanguage
      });

      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 lg:p-8 overflow-hidden bg-nature-50">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-nature-100 mix-blend-multiply opacity-50"></div>
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-nature-300 to-nature-500 opacity-20 filter blur-[100px] animate-float"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-t from-secondary-light to-secondary opacity-20 filter blur-[80px] animate-pulse-slow"></div>
      </div>

      {/* Main Glass Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-6xl grid lg:grid-cols-5 rounded-[2.5rem] overflow-hidden glass-panel shadow-2xl relative z-10"
      >
        
        {/* Left Side (Branding - Dark Green Glass) */}
        <div className="col-span-2 hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-nature-900/40 backdrop-blur-md border-r border-white/10">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nature-950/20 to-nature-950/80"></div>
          
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group hover:opacity-80 transition-opacity">
               <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md border border-white/10 shadow-sm group-hover:scale-105 transition-transform">
                  <Leaf className="w-6 h-6 text-nature-100" />
               </div>
               <span className="text-xl font-bold text-white tracking-tight">FarmSmart</span>
            </Link>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-nature-50 text-xs font-bold border border-white/10 mb-6 backdrop-blur-sm shadow-sm">
                <Sprout className="w-3.5 h-3.5" /> 
                <span className="uppercase tracking-wider">Join 10,000+ Farmers</span>
            </div>
            
            <h2 className="text-4xl font-black text-white leading-tight drop-shadow-md">
              Plant the Seeds <br />
              of <span className="text-nature-400">Success</span>
            </h2>
            <p className="mt-6 text-nature-100 text-base font-medium leading-relaxed max-w-sm">
              Create an account to unlock real-time market data, fair pricing, and a community that supports your growth.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-nature-500/20 flex items-center justify-center text-nature-300 font-bold border border-white/10">1</div>
                  <div className="text-sm">
                      <p className="text-white font-bold">Sign Up</p>
                      <p className="text-nature-200/80 mt-0.5">Quick & easy registration</p>
                  </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-full bg-nature-500/20 flex items-center justify-center text-nature-300 font-bold border border-white/10">2</div>
                  <div className="text-sm">
                      <p className="text-white font-bold">Get Verified</p>
                      <p className="text-nature-200/80 mt-0.5">Secure identity protection</p>
                  </div>
              </div>
          </div>
        </div>

        {/* Right Side (Form - Light Glass) */}
        <div className="col-span-3 flex flex-col p-6 sm:p-8 md:p-12 bg-white/60 backdrop-blur-xl relative h-[90vh] lg:h-auto overflow-y-auto scrollbar-hide">
          <div className="w-full max-w-lg mx-auto">
            
            <div className="mb-8">
              <div className="lg:hidden flex items-center justify-center mb-6">
                <div className="bg-gradient-to-br from-nature-500 to-nature-700 p-3 rounded-2xl shadow-lg shadow-nature-500/30 text-white">
                    <Leaf className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-nature-900 tracking-tight text-center lg:text-left">Create Account</h2>
              <p className="mt-2 text-nature-600 font-medium text-center lg:text-left">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  className="bg-red-50 border border-red-100 text-red-600 text-sm p-4 rounded-xl flex items-start gap-3 shadow-sm"
                >
                  <span className="font-bold text-lg leading-none">!</span>
                  <span className="font-medium leading-snug">{error}</span>
                </motion.div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">I am a</label>
                <div className="grid grid-cols-3 gap-3 p-1.5 rounded-2xl bg-white/50 border border-nature-200">
                  {['farmer', 'buyer', 'logistics'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2.5 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${role === r
                        ? "bg-nature-600 text-white shadow-lg shadow-nature-600/20 scale-100"
                        : "text-nature-600 hover:bg-white/80 hover:text-nature-800"
                        }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid for Name & Phone */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">Phone</label>
                    <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                        <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                        />
                    </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                    <input
                        type="password"
                        placeholder="Create a strong password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                    />
                  </div>
              </div>

              {/* Location Grid */}
              <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">State</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                        <input
                        type="text"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                        />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">District</label>
                    <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                        <input
                        type="text"
                        placeholder="District"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                        />
                    </div>
                  </div>
              </div>

              {/* Address */}
              <div className="space-y-1">
                  <label className="text-xs font-bold text-nature-700 uppercase tracking-wide ml-1">Address <span className="text-nature-400 font-normal normal-case">(Optional)</span></label>
                  <div className="relative group">
                    <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Village, Street, Landmark..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border border-nature-200 text-nature-900 placeholder-nature-300 focus:outline-none focus:ring-4 focus:ring-nature-500/10 focus:border-nature-500 transition-all shadow-sm group-hover:shadow-md"
                    />
                  </div>
              </div>

              <div className="pt-2">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-nature-600 to-nature-500 hover:from-nature-700 hover:to-nature-600 text-white font-bold text-lg shadow-lg shadow-nature-500/30 hover:shadow-nature-500/50 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Creating Account...</span>
                    </>
                    ) : (
                    <>
                        <span>Get Started</span>
                        <ArrowRight className="w-5 h-5" />
                    </>
                    )}
                </button>
              </div>

            </form>

            <div className="mt-8 text-center pb-4">
              <p className="text-nature-600 font-medium text-sm">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-nature-800 hover:text-nature-900 underline decoration-2 decoration-nature-400 hover:decoration-nature-600 underline-offset-4 transition-all">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
