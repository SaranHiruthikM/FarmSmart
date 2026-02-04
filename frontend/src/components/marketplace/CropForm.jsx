import { useState, useEffect } from "react";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { Loader2, Info, MapPin, Scale, BadgeIndianRupee } from "lucide-react";

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

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

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
                    <div className="grid grid-cols-3 gap-4">
                        {['A', 'B', 'C'].map((grade) => (
                            <label key={grade} className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-2xl cursor-pointer transition-all group ${formData.qualityGrade === grade
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
                                <span className={`text-2xl font-black ${formData.qualityGrade === grade ? 'text-primary' : 'text-accent opacity-50'}`}>
                                    {grade}
                                </span>
                                <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${formData.qualityGrade === grade ? 'text-primary' : 'text-accent'}`}>
                                    Grade {grade}
                                </span>
                            </label>
                        ))}
                    </div>
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
