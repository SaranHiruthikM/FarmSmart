import { useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { MapPin, Scale, ChevronRight, Edit, Trash2, Award, Gem, Sprout } from "lucide-react";

const CropCard = ({ crop, onDelete }) => {
    const navigate = useNavigate();

    // Check ownership
    const currentUser = authService.getCurrentUser();
    const currentUserId = currentUser?._id || currentUser?.id;
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
        if (onDelete) onDelete();
    };

    // Quality Badge Logic
    const getQualityColor = (grade) => {
        switch(grade) {
            case 'A': return 'bg-nature-100 text-nature-700 border-nature-200 ring-nature-100';
            case 'B': return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-50';
            default: return 'bg-orange-50 text-orange-700 border-orange-200 ring-orange-50';
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className="group relative glass-card rounded-3xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-nature-900/5 transition-all duration-300 cursor-pointer flex flex-col h-full border border-white/60"
        >
            {/* Image Placeholder with Gradient */}
            <div className="h-48 relative overflow-hidden bg-gradient-to-br from-nature-50 to-emerald-50/50 group-hover:from-nature-100 group-hover:to-emerald-100/50 transition-colors duration-500">
                <div className="absolute inset-0 flex items-center justify-center opacity-30 group-hover:opacity-40 group-hover:scale-110 transition-all duration-700">
                    <Sprout className="w-24 h-24 text-nature-300" strokeWidth={1} />
                </div>
                
                {/* Price Tag */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-white/50 z-10">
                    <span className="text-xs font-bold text-nature-400 uppercase tracking-wider block mb-0.5">Price</span>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-black text-nature-800">₹{crop.price || crop.expectedPrice}</span>
                        <span className="text-xs font-medium text-nature-400">/ {crop.quantityUnit || 'kg'}</span>
                    </div>
                </div>

                {/* Grade Badge */}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 text-xs font-bold rounded-xl border shadow-sm ring-2 ring-inset ${getQualityColor(crop.quality || 'B')} flex items-center gap-1.5`}>
                        <Gem className="w-3 h-3" />
                        Grade {crop.quality || 'B'}
                    </span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-6 flex flex-col flex-1">
                <div className="mb-4">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="text-xl font-black text-nature-900 group-hover:text-nature-600 transition-colors line-clamp-1">{crop.cropName}</h3>
                        {/* Variety Tag */}
                        <span className="text-[10px] font-bold uppercase tracking-wider text-nature-400 bg-nature-50 px-2 py-1 rounded-lg border border-nature-100">
                            {crop.variety || 'Organic'}
                        </span>
                    </div>
                   
                    <div className="flex items-center text-sm font-medium text-nature-500 mt-2">
                        <MapPin className="w-4 h-4 mr-1.5 text-nature-400" />
                        <span className="truncate">{crop.location?.district || 'Unknown'}, {crop.location?.state || 'Location'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/40 rounded-2xl border border-white/40">
                    <div>
                        <span className="text-[10px] font-bold text-nature-400 uppercase tracking-wider block mb-1">Quantity</span>
                        <div className="flex items-center gap-1.5 text-nature-800 font-bold">
                            <Scale className="w-4 h-4 text-nature-400" />
                            {crop.quantity} {crop.quantityUnit || 'kg'}
                        </div>
                    </div>
                     <div>
                        <span className="text-[10px] font-bold text-nature-400 uppercase tracking-wider block mb-1">Harvest Date</span>
                        <div className="text-sm font-bold text-nature-700">
                             {new Date(crop.harvestDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-auto pt-4 border-t border-nature-100 flex gap-2">
                    {isOwner ? (
                        <>
                            <button
                                onClick={handleEdit}
                                className="p-2.5 rounded-xl bg-nature-50 text-nature-600 hover:bg-nature-500 hover:text-white transition-all"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    ) : null}

                    <div className={`flex-1 flex items-center justify-between px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${
                        isOwner 
                        ? 'bg-nature-100 text-nature-800 hover:bg-nature-200' 
                        : 'bg-nature-600 text-white hover:bg-nature-700 shadow-nature-600/20'
                    }`}>
                        <span>{isOwner ? "View Details" : "View Listing"}</span>
                        <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropCard;
