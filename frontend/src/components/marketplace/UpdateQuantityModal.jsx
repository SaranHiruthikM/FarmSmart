import { useState } from "react";
import { Loader2, X, Scale } from "lucide-react";
import PrimaryButton from "../common/PrimaryButton";

const UpdateQuantityModal = ({ isOpen, onClose, onUpdate, currentQuantity, unit, isLoading }) => {
    const [quantity, setQuantity] = useState(currentQuantity);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(quantity);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all border border-neutral-light">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Scale className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-black text-text-dark uppercase tracking-wider">Update Stock</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-light rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-accent" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-black text-accent uppercase tracking-widest mb-2">New Quantity ({unit})</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    className="w-full px-4 py-4 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-2xl text-text-dark transition-all"
                                    placeholder="0"
                                    autoFocus
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-accent opacity-50 uppercase tracking-widest">
                                    {unit}
                                </span>
                            </div>
                            <p className="mt-2 text-[10px] text-accent font-medium leading-relaxed">
                                Enter the total available stock for this listing. This will be visible to all potential buyers.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border-2 border-neutral-light text-accent font-black rounded-xl hover:bg-neutral-light transition-all text-sm uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <PrimaryButton
                                type="submit"
                                disabled={isLoading}
                                className="flex-[2] py-3 text-sm"
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Update Stock"}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateQuantityModal;
