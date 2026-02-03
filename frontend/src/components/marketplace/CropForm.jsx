import { useState } from "react";
import InputField from "../common/InputField";
import PrimaryButton from "../common/PrimaryButton";
import { Loader2 } from "lucide-react";

const CropForm = ({ initialData, onSubmit, isLoading, buttonLabel = "Submit" }) => {
    const [formData, setFormData] = useState(
        initialData || {
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
        }
    );

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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                    label="Crop Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Tomato"
                    required
                />
                <InputField
                    label="Variety"
                    name="variety"
                    value={formData.variety}
                    onChange={handleChange}
                    placeholder="e.g. Hybrid"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                    <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-accent/20 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-text-dark"
                    >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                        <option value="ton">ton</option>
                    </select>
                </div>
                <InputField
                    label="Base Price (per unit)"
                    name="basePrice"
                    type="number"
                    value={formData.basePrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality Grade</label>
                <div className="flex gap-4">
                    {['A', 'B', 'C'].map((grade) => (
                        <label key={grade} className={`flex-1 border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-all ${formData.qualityGrade === grade ? 'bg-primary/10 border-primary text-primary font-bold shadow-sm' : 'border-neutral-light hover:bg-neutral-light'}`}>
                            <input
                                type="radio"
                                name="qualityGrade"
                                value={grade}
                                checked={formData.qualityGrade === grade}
                                onChange={handleChange}
                                className="sr-only"
                            />
                            Grade {grade}
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4 border-t border-accent/10 pt-4 mt-2">
                <h3 className="text-sm font-bold text-text-dark">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField
                        label="State"
                        name="location.state"
                        value={formData.location.state}
                        onChange={handleChange}
                        placeholder="State"
                    />
                    <InputField
                        label="District"
                        name="location.district"
                        value={formData.location.district}
                        onChange={handleChange}
                        placeholder="District"
                    />
                    <InputField
                        label="Village"
                        name="location.village"
                        value={formData.location.village}
                        onChange={handleChange}
                        placeholder="Village"
                    />
                </div>
            </div>

            <div className="pt-4">
                <PrimaryButton disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : buttonLabel}
                </PrimaryButton>
            </div>
        </form>
    );
};

export default CropForm;
