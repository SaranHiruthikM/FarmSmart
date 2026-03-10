import { useState, useEffect } from "react";
import {
    User, Mail, Phone, MapPin, Briefcase, Languages, Edit2, Check, X, Loader2,
    Home, Save
} from "lucide-react";
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

        const profileKeys = ['fullName', 'email', 'state', 'district', 'address', 'preferredLanguage', 'phoneNumber'];

        if (profileKeys.includes(field)) {
            let processedValue = value;
            if (field === 'fullName') {
                processedValue = value.replace(/\b\w/g, l => l.toUpperCase());
            }

            setFormData(prev => ({ ...prev, [field]: processedValue }));
            setMessage({ type: "info", text: `Updated ${field} to "${processedValue}". Click Save to confirm.` });
            setIsEditing(true);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (!loading) {
            const pendingString = sessionStorage.getItem('pendingVoiceAction');
            if (pendingString) {
                try {
                    const action = JSON.parse(pendingString);
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
            await fetchProfile();
            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully! ✨" });
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
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-nature-600 animate-spin mx-auto mb-4" />
                    <p className="text-nature-600 font-medium">Fetching your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-10 max-w-5xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-nature-900 tracking-tight">My Profile</h1>
                    <p className="text-nature-600 mt-1 font-medium text-lg">Manage your personal information and preferences.</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-nature-600 text-white rounded-2xl font-bold shadow-lg shadow-nature-600/30 hover:bg-nature-700 hover:-translate-y-1 transition-all duration-300"
                    >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                    </button>
                ) : (
                    <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-6 py-3 bg-white/50 text-nature-700 rounded-2xl font-bold hover:bg-white transition-all shadow-sm border border-nature-200"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                )}
            </div>

            {/* Alert Message */}
            {message.text && (
                <div
                    className={`mb-6 p-4 rounded-2xl border flex items-center gap-3 font-medium animate-in slide-in-from-top-2 ${message.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                >
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl text-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-nature-400 to-nature-600"></div>
                        <div className="w-32 h-32 rounded-full bg-nature-100 mx-auto mb-4 flex items-center justify-center border-4 border-white/50 shadow-inner relative overflow-hidden ring-4 ring-nature-50">
                            <img
                                src={`https://ui-avatars.com/api/?name=${user?.fullName || 'User'}&background=16a34a&color=fff&size=128&bold=true`}
                                alt="User Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <h2 className="text-2xl font-black text-nature-900 mb-1 tracking-tight">{user?.fullName}</h2>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-nature-100 text-nature-700 text-xs font-black uppercase tracking-widest mb-6 border border-nature-200">
                            {user?.role}
                        </span>

                        <div className="pt-6 border-t border-nature-200/50 flex flex-col items-center gap-3">
                            <div className="flex items-center gap-2 text-nature-600 text-sm font-medium">
                                <Phone className="w-4 h-4" />
                                {user?.phoneNumber}
                            </div>
                            <div className="flex items-center gap-2 text-nature-600 text-sm font-medium">
                                <MapPin className="w-4 h-4" />
                                {user?.district}, {user?.state}
                            </div>
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-gradient-to-br from-nature-600 to-nature-800 p-8 rounded-3xl shadow-xl shadow-nature-900/10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Check className="w-32 h-32" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xs font-black uppercase tracking-widest text-nature-200">Verified Account</span>
                                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                                    <Check className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-nature-50 font-medium leading-relaxed opacity-90">
                                Your identity is verified. This helps build trust with buyers and farmers throughout the platform.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Form Fields */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-panel p-8 rounded-3xl space-y-10">
                        {/* Section: Basic Information */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-nature-100 rounded-xl">
                                    <User className="w-6 h-6 text-nature-600" />
                                </div>
                                <h3 className="text-xl font-black text-nature-900 tracking-tight">Basic Information</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="Full Name"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={User}
                                    placeholder="Enter your full name"
                                    required
                                />
                                <FormInput
                                    label="Email Address"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={Mail}
                                    placeholder="john@example.com"
                                />
                                <FormInput
                                    label="Phone Number"
                                    value={user?.phoneNumber}
                                    disabled
                                    icon={Phone}
                                    helperText="Phone number cannot be changed"
                                />
                                <FormInput
                                    label="Account Role"
                                    value={user?.role}
                                    disabled
                                    icon={Briefcase}
                                    helperText="Role is fixed upon registration"
                                />
                            </div>
                        </div>

                        {/* Section: Localization */}
                        <div className="pt-8 border-t border-nature-200/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-sky-50 rounded-xl">
                                    <Languages className="w-6 h-6 text-sky-600" />
                                </div>
                                <h3 className="text-xl font-black text-nature-900 tracking-tight">Preferences</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-nature-600 mb-2 uppercase tracking-wide ml-1">Preferred Language</label>
                                    {!isEditing ? (
                                        <div className="flex items-center gap-4 p-4 bg-nature-50/50 rounded-2xl border border-transparent font-bold text-nature-900">
                                            <Languages className="w-5 h-5 text-nature-400 shrink-0" />
                                            <span>{formData.preferredLanguage === 'en' ? 'English' : 'Hindi'}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-4 px-4 py-4 bg-white/60 border border-nature-200 rounded-2xl focus-within:ring-2 focus-within:ring-nature-400 focus-within:border-nature-400 transition-all group shadow-sm">
                                            <div className="shrink-0">
                                                <Languages className="w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors pointer-events-none" />
                                            </div>
                                            <select
                                                name="preferredLanguage"
                                                value={formData.preferredLanguage}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent outline-none font-bold text-nature-900 cursor-pointer"
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
                        <div className="pt-8 border-t border-nature-200/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-orange-50 rounded-xl">
                                    <MapPin className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-xl font-black text-nature-900 tracking-tight">Location Details</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleInputChange}
                                    isEditing={isEditing}
                                    icon={MapPin}
                                    placeholder="Enter state"
                                    required
                                />
                                <FormInput
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
                                    <FormInput
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
                            <div className="pt-8 border-t border-nature-200/50 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 px-10 py-4 bg-nature-600 text-white rounded-2xl font-black shadow-xl shadow-nature-600/20 hover:bg-nature-700 hover:-translate-y-1 transition-all duration-300 disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {saving ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </form>
        </div>
    );
};

// Internal Component for Form Fields
const FormInput = ({ label, name, value, onChange, isEditing, icon: Icon, disabled, placeholder, type = "text", required, helperText }) => (
    <div className="space-y-2">
        <label className="block text-sm font-bold text-nature-600 uppercase tracking-wide ml-1">{label}</label>
        {!isEditing || disabled ? (
            <div className={`
                flex items-center gap-4 p-4 bg-nature-50/50 rounded-2xl border border-transparent font-bold
                ${disabled ? 'text-nature-400 cursor-not-allowed' : 'text-nature-900'}
            `}>
                <div className="shrink-0">
                    <Icon className={`w-5 h-5 ${disabled ? 'text-nature-300' : 'text-nature-400'}`} />
                </div>
                <span className="truncate">{value || "Not provided"}</span>
            </div>
        ) : (
            <div className="flex items-center gap-4 px-4 py-4 bg-white/60 border border-nature-200 rounded-2xl focus-within:ring-2 focus-within:ring-nature-400 focus-within:border-nature-400 transition-all group shadow-sm hover:shadow-md">
                <div className="shrink-0">
                    <Icon className="w-5 h-5 text-nature-400 group-focus-within:text-nature-600 transition-colors pointer-events-none" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className="w-full bg-transparent outline-none font-bold text-nature-900 placeholder:text-nature-300"
                />
            </div>
        )}
        {helperText && <p className="text-[10px] text-nature-400 font-bold uppercase tracking-widest ml-1">{helperText}</p>}
    </div>
);

export default Profile;
