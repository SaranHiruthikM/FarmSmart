import { MapPin, Scale, BadgeIndianRupee, ChevronRight, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";

const CropCard = ({ crop, onDelete }) => {
    const navigate = useNavigate();
    
    // Check ownership
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.id;
    // crop.farmer is the ID string from our service transformation
    const isOwner = currentUser && (currentUser.role === "FARMER" || currentUser.role === "farmer") && crop.farmer === currentUserId;

    const handleCardClick = () => {
        navigate(`/dashboard/marketplace/${crop._id}`);
    };

    const handleEdit = (e) => {
        e.stopPropagation();
        navigate(`/dashboard/my-crops/edit/${crop._id}`);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete();
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-neutral-light group overflow-hidden flex flex-col h-full cursor-pointer"
        >
            {/* Image Section */}
            <div className="h-48 bg-gradient-to-br from-green-50 to-emerald-50 relative flex items-center justify-center group-hover:bg-green-100/50 transition-colors">
                <div className="text-secondary opacity-40 flex flex-col items-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-5xl">🌾</span>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-[10px] font-black tracking-widest uppercase rounded-full shadow-sm border ${crop.qualityGrade === 'A' ? 'bg-green-100 text-green-700 border-green-200' :
                        crop.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-red-100 text-red-700 border-red-200'
                        }`}>
                        Grade {crop.qualityGrade}
                    </span>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                {/* Header */}
                <div className="mb-4">
                    <h3 className="text-lg font-black text-text-dark line-clamp-1 group-hover:text-primary transition-colors">{crop.name}</h3>
                    <p className="text-xs text-accent font-bold uppercase tracking-wider mt-0.5">{crop.variety || 'Standard Variety'}</p>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Quantity</p>
                        <div className="flex items-center text-sm font-black text-text-dark">
                            <Scale className="w-3.5 h-3.5 mr-1.5 text-primary" />
                            {crop.quantity} <span className="text-xs text-accent font-medium ml-1 uppercase">{crop.unit}</span>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Price / {crop.unit}</p>
                        <div className="flex flex-col">
                            <div className="flex items-center text-sm font-black text-primary">
                                <BadgeIndianRupee className="w-3.5 h-3.5 mr-1" />
                                <span>₹{crop.finalPrice || crop.basePrice}</span>
                            </div>
                            {crop.finalPrice !== crop.basePrice && (
                                <span className="text-[9px] text-accent font-medium line-through decoration-red-400/50">₹{crop.basePrice} base</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="mb-6 pt-4 border-t border-neutral-light/50">
                    <div className="flex items-center text-xs text-accent font-medium">
                        <MapPin className="w-3.5 h-3.5 mr-2 text-red-400" />
                        <span className="truncate">{crop.location.district}, {crop.location.state}</span>
                    </div>
                </div>

                {/* Action Area */}
                <div className="mt-auto flex gap-2">
                    {isOwner ? (
                        <>
                            <button
                                onClick={handleEdit}
                                className="p-2.5 bg-neutral-light/50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="Edit Listing"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2.5 bg-neutral-light/50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                title="Delete Listing"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : null}
                    
                    <div
                        className="flex-1 flex items-center justify-between px-4 py-2.5 bg-neutral-light/50 text-text-dark text-xs font-black uppercase tracking-widest rounded-xl group-hover:bg-primary group-hover:text-white transition-all group/btn"
                    >
                        {isOwner ? "View Details" : "Buy / Bid"}
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropCard;
