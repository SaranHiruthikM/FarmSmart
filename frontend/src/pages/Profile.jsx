import { useState, useEffect } from "react";
import {
    User, Mail, Phone, MapPin, Briefcase, Languages, Edit2, Check, X, Loader2,
    Map as MapIcon, Home, Save,
    Icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import authService from "../services/auth.service";


const Profile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        preferredLanguage: "en",
        state: "",
        district: "",
        address: ""
    });
    const [message, setMessage] = useState({ type: "", text: "" });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await authService.getProfile();
            setUser(data);
            setFormData({
                fullName: data.fullName || "",
                email: data.email || "",
                preferredLanguage: data.preferredLanguage || "en",
                state: data.state || "",
                district: data.district || "",
                address: data.address || ""
            });
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setMessage({ type: "error", text: "Failed to load profile details." });
        } finally {
            setLoading(false);
        }
    };

    // Voice Command Handler
    const processVoiceAction = (field, value) => {
        if (!field || !value) return;

        // Check if this field applies to Profile
        const profileKeys = ['fullName', 'email', 'state', 'district', 'address', 'preferredLanguage', 'phoneNumber'];
        
        if (profileKeys.includes(field)) {
            // Capitalize Name
            let processedValue = value;
            if (field === 'fullName') {
                 processedValue = value.replace(/\b\w/g, l => l.toUpperCase());
            }

            setFormData(prev => ({ ...prev, [field]: processedValue }));
            setMessage({ type: "info", text: `Updated ${field} to "${processedValue}". Click Save to confirm.` });
            setIsEditing(true);
        }
    };

    // 1. Initial Load
    useEffect(() => {
        fetchProfile();
    }, []);

    // 2. Check for pending actions whenever loading finishes
    useEffect(() => {
        if (!loading) {
            const pendingString = sessionStorage.getItem('pendingVoiceAction');
            if (pendingString) {
                try {
                    const action = JSON.parse(pendingString);
                    // Check timestamp validity (10s)
                    if (action.type === 'fill-form' && Date.now() - action.timestamp < 10000) {
                        processVoiceAction(action.field, action.value);
                    }
                } catch (e) {
                    console.error("Failed to parse pending voice action", e);
                } finally { 
                    // Always clear it so it doesn't re-apply on refresh
                    sessionStorage.removeItem('pendingVoiceAction');
                }
            }
        }
    }, [loading]);

    // 3. Listen for live voice commands
    useEffect(() => {
        const handleVoiceUpdate = (e) => {
            const { field, value } = e.detail;
            processVoiceAction(field, value);
        };

        window.addEventListener('voice-fill-form', handleVoiceUpdate);
        return () => window.removeEventListener('voice-fill-form', handleVoiceUpdate);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            await authService.updateProfile(formData);
            await fetchProfile(); // Refresh data
            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully! ✨" });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ type: "", text: "" }), 3000);
        } catch (error) {
            console.error("Failed to update profile:", error);
            setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium tracking-wide">Fetching your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A1F1B]">My Profile</h1>
                    <p className="text-[#5C715E] mt-1 font-medium">Manage your personal information and preferences.</p>
                </div>
                {!isEditing ? (
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </motion.button>
                ) : (
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all font-sans"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </motion.button>
                    </div>
                )}
            </div>

            {/* Alert Message */}
            <AnimatePresence>
                {message.text && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 p-4 rounded-xl border flex items-center gap-3 font-medium ${message.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                            }`}
                    >
                        {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                        <div className="w-32 h-32 rounded-3xl bg-green-50 mx-auto mb-4 flex items-center justify-center border-4 border-white shadow-md relative overflow-hidden">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=166534&color=fff&size=128`}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-xl font-bold text-[#1A1F1B] mb-1">{user?.fullName}</h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100/50 text-primary text-xs font-bold uppercase tracking-wider mb-4 border border-green-200/50">
                            {user?.role}
                        </span>

                        <div className="pt-4 border-t border-gray-50 flex flex-col items-center gap-2">
                            <div className="flex items-center gap-2 text-[#5C715E] text-sm font-medium">
                                <Phone className="w-4 h-4" />
                                {user?.phoneNumber}
                            </div>
                            <div className="flex items-center gap-2 text-[#5C715E] text-sm font-medium">
                                <MapPin className="w-4 h-4" />
                                {user?.district}, {user?.state}
                            </div>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl shadow-lg shadow-primary/20 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-primary-light">Verified Account</span>
                            <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                <Check className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-sm font-medium leading-relaxed">
                            Your identity is verified. This helps build trust with buyers and farmers on FarmSmart.
                        </p>
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                        {/* Section: Basic Information */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1A1F1B]">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={User}
                                    placeholder="Enter your full name"
                                    required
                                />
                                <FormField
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={Mail}
                                    placeholder="john@example.com"
                                />
                                <FormField
                                    label="Phone Number"
                                    value={user?.phoneNumber}
                                    disabled
                                    icon={Phone}
                                    helperText="Phone number cannot be changed"
                                />
                                <FormField
                                    label="Account Role"
                                    value={user?.role}
                                    disabled
                                    icon={Briefcase}
                                    helperText="Role is fixed upon registration"
                                />
                            </div>
                        </div>

                        {/* Section: Localization */}
                        <div className="pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Languages className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1A1F1B]">Preferences</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-[#5C715E] mb-2 font-sans uppercase tracking-wide">Preferred Language</label>
                                    {!isEditing ? (
                                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent font-medium text-[#1A1F1B]">
                                            <Languages className="w-5 h-5 text-gray-400 shrink-0" />
                                            <span>{formData.preferredLanguage === 'en' ? 'English' : 'Hindi'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 px-4 py-4 bg-white border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all group">
                                            <div className="shrink-0">
                                                <Languages className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                                            </div>
                                            <select
                                                name="preferredLanguage"
                                                value={formData.preferredLanguage}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent outline-none font-medium text-[#1A1F1B] appearance-none cursor-pointer"
                                            >
                                                <option value="en">English</option>
                                                <option value="hi">Hindi</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Section: Location */}
                        <div className="pt-8 border-t border-gray-50">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <MapIcon className="w-5 h-5 text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-[#1A1F1B]">Location Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={MapIcon}
                                    placeholder="Enter state"
                                    required
                                />
                                <FormField
                                    label="District"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={MapPin}
                                    placeholder="Enter district"
                                    required
                                />
                                <div className="md:col-span-2">
                                    <FormField
                                        label="Village / Full Address"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        isEditing={isEditing}
                                        icon={Home}
                                        placeholder="Enter village name or full address"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        {isEditing && (
                            <div className="pt-8 border-t border-gray-50 flex justify-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-70"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                </motion.button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

const FormField = ({ label, name, value, onChange, isEditing, icon: Icon, disabled, placeholder, type = "text", required, helperText }) => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-[#5C715E] font-sans uppercase tracking-wide ml-1">{label}</label>
        {!isEditing || disabled ? (
            <div className={`
                flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-transparent font-medium
                ${disabled ? 'text-gray-400 opacity-80 cursor-not-allowed' : 'text-[#1A1F1B]'}
            `}>
                <div className="shrink-0">
                    <Icon className={`w-5 h-5 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
                </div>
                <span className="truncate">{value || "Not provided"}</span>
            </div>
        ) : (
            <div className="flex items-center gap-4 px-4 py-4 bg-white border border-gray-200 rounded-2xl focus-within:ring-4 focus-within:ring-primary/10 focus-within:border-primary transition-all group">
                <div className="shrink-0">
                    <Icon className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors pointer-events-none" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-transparent outline-none font-medium text-[#1A1F1B] placeholder:text-gray-300"
                />
            </div>
        )}
        {helperText && <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest ml-1">{helperText}</p>}
    </div>
);

export default Profile;
