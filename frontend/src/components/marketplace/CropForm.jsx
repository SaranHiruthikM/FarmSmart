import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { Loader2, Info, MapPin, Scale, BadgeIndianRupee, TrendingUp, HelpCircle } from "lucide-react";
import qualityService from "../../services/quality.service";
import ContextualSchemeAlert from "../schemes/ContextualSchemeAlert";

const CropForm = ({ initialData, onSubmit, isLoading, buttonLabel = "Submit" }) => {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
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
            if (initialData.imageUrl) {
                setPreviewUrl(initialData.imageUrl);
            }
        }
    }, [initialData]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };


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

        const pendingAction = sessionStorage.getItem('pendingVoiceAction');
        if (pendingAction) {
            try {
                const action = JSON.parse(pendingAction);
                if (action.type === 'fill-form' && Date.now() - action.timestamp < 10000) {

                     processVoiceAction(action.field, action.value);
                     sessionStorage.removeItem('pendingVoiceAction');

                }
            } catch (e) { console.error(e); }
        }

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
        if (!formData.name || !formData.quantity || !formData.basePrice) {
            alert("Please fill in all required fields.");
            return;
        }
        onSubmit({ ...formData, imageFile });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
             {/* Image Upload Section */}
             <div className="space-y-4 bg-nature-50 p-6 rounded-2xl border border-nature-200">
                <label className="text-sm font-bold text-nature-700 uppercase tracking-wide">Crop Photo {(!initialData?.imageUrl) && "*"}</label>
                <div className="flex items-center gap-6">
                    <div className="w-32 h-32 bg-white rounded-xl border-2 border-dashed border-nature-300 flex items-center justify-center overflow-hidden shadow-inner transition-colors">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-nature-400 text-xs text-center px-2">No Image Selected</span>
                        )}
                    </div>
                    <div>
                         <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-nature-200 text-nature-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-nature-50 hover:border-nature-300 transition-all shadow-sm">
                            Choose Image
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange} 
                                className="hidden" 
                                required={!initialData?.imageUrl} 
                            />
                        </label>
                        <p className="mt-2 text-xs text-nature-500 font-medium">Supports: JPG, PNG (Max 5MB)</p>
                    </div>
                </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-nature-200 pb-2">
                    <div className="bg-nature-100 p-2 rounded-lg">
                        <Info className="w-5 h-5 text-nature-600" />
                    </div>
                    <h3 className="text-lg font-black text-nature-800 uppercase tracking-wider">Crop Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <div className="space-y-6">
                 <div className="flex items-center gap-3 border-b border-nature-200 pb-2">
                    <div className="bg-nature-100 p-2 rounded-lg">
                        <Scale className="w-5 h-5 text-nature-600" />
                    </div>
                    <h3 className="text-lg font-black text-nature-800 uppercase tracking-wider">Stock & Pricing</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                        <label className="block text-sm font-bold text-nature-800 mb-1.5 ml-1">Unit</label>
                        <select
                            name="unit"
                            value={formData.unit}
                            onChange={handleChange}
                            className="
                              w-full px-4 py-3
                              bg-white/60 backdrop-blur-sm
                              border border-nature-200
                              text-nature-900
                              rounded-xl
                              focus:ring-2 focus:ring-nature-400/50
                              focus:border-nature-400
                              focus:bg-white
                              outline-none
                              transition-all
                              shadow-sm
                              font-medium
                            "
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
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-nature-200 pb-2">
                    <div className="bg-nature-100 p-2 rounded-lg">
                         <BadgeIndianRupee className="w-5 h-5 text-nature-600" />
                    </div>
                    <h3 className="text-lg font-black text-nature-800 uppercase tracking-wider">Quality Standard</h3>
                </div>
                
                <div>
                    <label className="block text-sm font-bold text-nature-800 mb-4 ml-1">Select Quality Grade</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {['A', 'B', 'C'].map((grade) => (
                            <div key={grade} className="space-y-3">
                                <label className={`relative flex flex-col items-center justify-center p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 group ${formData.qualityGrade === grade
                                    ? 'border-nature-500 bg-nature-50 shadow-md scale-[1.02]'
                                    : 'border-nature-200 bg-white/40 hover:border-nature-300 hover:bg-white/60'
                                    }`}>
                                    <input
                                        type="radio"
                                        name="qualityGrade"
                                        value={grade}
                                        checked={formData.qualityGrade === grade}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <span className={`text-3xl font-black ${formData.qualityGrade === grade ? 'text-nature-700' : 'text-nature-300'}`}>
                                        {grade}
                                    </span>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-2 ${formData.qualityGrade === grade ? 'text-nature-600' : 'text-nature-400'}`}>
                                        Grade {grade}
                                    </span>
                                </label>
                                <div className="flex items-start gap-2 px-2 min-h-[40px]">
                                    <HelpCircle className="w-3.5 h-3.5 text-nature-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-nature-500 font-medium leading-relaxed">
                                        {hints[grade]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Preview */}
                    {priceImpact && (
                        <div className="mt-8 p-6 bg-gradient-to-br from-nature-50 to-white rounded-[2rem] border border-nature-200 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative shadow-sm">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <TrendingUp className="w-32 h-32" />
                            </div>
                            <div className="space-y-1 relative z-10 text-center md:text-left">
                                <h4 className="text-[10px] font-black text-nature-500 uppercase tracking-[0.2em]">Predicted Market Price</h4>
                                <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                    <span className="text-4xl font-black text-nature-900 tracking-tight">₹{priceImpact.finalPrice}</span>
                                    <span className="text-xs text-nature-500 font-bold uppercase">per {formData.unit}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 relative z-10 bg-white/50 px-6 py-3 rounded-2xl border border-white/50 backdrop-blur-sm">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-nature-400 uppercase tracking-widest mb-1">Base</p>
                                    <p className="font-bold text-nature-700">₹{priceImpact.basePrice}</p>
                                </div>
                                <div className="w-px h-8 bg-nature-200"></div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-nature-400 uppercase tracking-widest mb-1">Impact</p>
                                    <p className={`font-black ${priceImpact.percentage > 0 ? 'text-nature-600' : priceImpact.percentage < 0 ? 'text-rose-500' : 'text-nature-700'}`}>
                                        {priceImpact.percentage > 0 ? '+' : ''}{priceImpact.percentage}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-nature-200 pb-2">
                    <div className="bg-nature-100 p-2 rounded-lg">
                        <MapPin className="w-5 h-5 text-nature-600" />
                    </div>
                    <h3 className="text-lg font-black text-nature-800 uppercase tracking-wider">Farm Location</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                <button
                    type="submit"
                    disabled={isLoading} 
                    className="w-full py-4 text-lg font-black text-white bg-nature-600 rounded-2xl hover:bg-nature-700 hover:-translate-y-1 hover:shadow-lg hover:shadow-nature-600/30 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : buttonLabel}
                </button>
            </div>

            {/* Contextual Subsidy Buddy */}
            <ContextualSchemeAlert
                currentCrop={formData.name}
                currentState={formData.location.state}
            />
        </form>
    );
};

export default CropForm;
