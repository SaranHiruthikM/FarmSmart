import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { Loader2, Info, MapPin, Scale, BadgeIndianRupee, TrendingUp, HelpCircle } from "lucide-react";
import qualityService from "../../services/quality.service";

const CropForm = ({ initialData, onSubmit, isLoading, buttonLabel = "Submit" }) => {
    const [formData, setFormData] = useState({
        name: "",
        variety: "",
        quantity: "",
        unit: "kg",
        basePrice: "",
        qualityGrade: "A",
        location: {
            state: "",
            district: "",
            village: "",
        },
    });

    const [priceImpact, setPriceImpact] = useState(null);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    useEffect(() => {
        const calculateImpact = async () => {
            if (formData.basePrice) {
                const impact = await qualityService.getPriceImpact(formData.qualityGrade, formData.basePrice);
                setPriceImpact(impact);
            } else {
                setPriceImpact(null);
            }
        };
        calculateImpact();
    }, [formData.qualityGrade, formData.basePrice]);

    // Voice Command Listener for Crop Form
    useEffect(() => {
        const processVoiceAction = (field, value) => {
            if (!field || !value) return;

            // Handle Nested Location Fields
            if (['state', 'district', 'village'].includes(field)) {
                setFormData(prev => ({
                    ...prev,
                    location: {
                        ...prev.location,
                        [field]: value
                    }
                }));
                return;
            }

            // Handle Direct Fields (name, variety, quantity, basePrice, qualityGrade)
            if (['name', 'variety', 'quantity', 'basePrice', 'qualityGrade'].includes(field)) {
                // If user says "50 rupees" for price, strip "rupees" - simple heuristic
                let cleanValue = value;
                if (field === 'basePrice' || field === 'quantity') {
                    cleanValue = value.replace(/[^0-9.]/g, ''); 
                }
                
                setFormData(prev => ({ ...prev, [field]: cleanValue }));
            }
        };

        // 1. Check pending actions (e.g. "Edit crop X" -> "Set price to Y")
        // Note: Usually "Edit Crop X" just navigates. But "Set price to Y" might be said *after* appearing on this page.
        // OR if user said "Change price of wheat to 50" -> Navigation -> Fill.
        const pendingAction = sessionStorage.getItem('pendingVoiceAction');
        if (pendingAction) {
            try {
                const action = JSON.parse(pendingAction);
                if (action.type === 'fill-form' && Date.now() - action.timestamp < 10000) {
                     processVoiceAction(action.field, action.value);
                     sessionStorage.removeItem('pendingVoiceAction'); // Clear it
                }
            } catch (e) { console.error(e); }
        }

        // 2. Listen for live events
        const handleVoiceEvent = (e) => {
             const { field, value } = e.detail;
             processVoiceAction(field, value);
        };

        window.addEventListener('voice-fill-form', handleVoiceEvent);
        return () => window.removeEventListener('voice-fill-form', handleVoiceEvent);
    }, []);

    const hints = qualityService.getGradeHints();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes(".")) {
            const [parent, child] = name.split(".");
            setFormData((prev) => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value,
                },
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Basic validation
        if (!formData.name || !formData.quantity || !formData.basePrice) {
            alert("Please fill in all required fields.");
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Info className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black text-text-dark uppercase tracking-wider">Crop Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="Crop Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Sona Masuri Rice"
                        required
                    />
                    <InputField
                        label="Variety (Optional)"
                        name="variety"
                        value={formData.variety}
                        onChange={handleChange}
                        placeholder="e.g. Hybrid / Organic"
                    />
                </div>
            </div>

            {/* Quantity & Price */}
            <div className="space-y-4 pt-4 border-t border-neutral-light/50">
                <div className="flex items-center gap-2 mb-4">
                    <Scale className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black text-text-dark uppercase tracking-wider">Stock & Pricing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField
                        label="Quantity"
                        name="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        required
                    />
                    <div>
                        <label className="block text-xs font-black text-accent uppercase tracking-widest mb-2">Unit</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border-2 border-neutral-light rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-text-dark font-bold transition-all"
                        >
                            <option value="kg">kilogram (kg)</option>
                            <option value="quintal">quintal</option>
                            <option value="ton">ton</option>
                        </select>
                    </div>
                    <InputField
                        label="Expected Price (per unit)"
                        name="basePrice"
                        type="number"
                        value={formData.basePrice}
                        onChange={handleChange}
                        placeholder="₹ 0.00"
                        required
                    />
                </div>
            </div>

            {/* Quality Grade */}
            <div className="space-y-4 pt-4 border-t border-neutral-light/50">
                <div className="flex items-center gap-2 mb-4">
                    <BadgeIndianRupee className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black text-text-dark uppercase tracking-wider">Quality Standard</h3>
                </div>
                <div>
                    <label className="block text-xs font-black text-accent uppercase tracking-widest mb-4">Select Quality Grade</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {['A', 'B', 'C'].map((grade) => (
                            <div key={grade} className="space-y-3">
                                <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all group ${formData.qualityGrade === grade
                                    ? 'border-primary bg-primary/5 shadow-inner'
                                    : 'border-neutral-light hover:border-primary/30'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="qualityGrade"
                                        value={grade}
                                        checked={formData.qualityGrade === grade}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className={`text-3xl font-black ${formData.qualityGrade === grade ? 'text-primary' : 'text-accent opacity-50'}`}>
                                        {grade}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${formData.qualityGrade === grade ? 'text-primary' : 'text-accent'}`}>
                                        Grade {grade}
                                    </span>
                                </label>
                                <div className="flex items-start gap-2 px-2">
                                    <HelpCircle className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-accent font-medium leading-relaxed">
                                        {hints[grade]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Preview */}
                    {priceImpact && (
                        <div className="mt-8 p-6 bg-green-50 rounded-[2rem] border-2 border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <div className="space-y-1 relative z-10 text-center md:text-left">
                                <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Quality Price Adjustment</h4>
                                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                    <span className="text-3xl font-black text-text-dark">₹{priceImpact.finalPrice}</span>
                                    <span className="text-xs text-accent font-bold uppercase">per {formData.unit}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 relative z-10">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Base Price</p>
                                    <p className="font-bold text-text-dark">₹{priceImpact.basePrice}</p>
                                </div>
                                <div className="w-px h-8 bg-primary/20"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Impact</p>
                                    <p className={`font-black ${priceImpact.percentage > 0 ? 'text-green-600' : priceImpact.percentage < 0 ? 'text-red-500' : 'text-text-dark'}`}>
                                        {priceImpact.percentage > 0 ? '+' : ''}{priceImpact.percentage}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-4 pt-4 border-t border-neutral-light/50">
                <div className="flex items-center gap-2 mb-4">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-black text-text-dark uppercase tracking-wider">Farm Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                        label="State"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleChange}
                        placeholder="Enter State"
                        required
                    />
                    <InputField
                        label="District"
                        name="location.district"
                        value={formData.location.district}
                        onChange={handleChange}
                        placeholder="Enter District"
                        required
                    />
                </div>
                <InputField
                    label="Village / Landmark (Optional)"
                    name="location.village"
                    value={formData.location.village}
                    onChange={handleChange}
                    placeholder="e.g. Near Primary School, Rampur"
                />
            </div>

            <div className="pt-8">
                <PrimaryButton disabled={isLoading} className="w-full py-4 text-lg">
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : buttonLabel}
                </PrimaryButton>
            </div>
        </form>
    );
};

export default CropForm;
