import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Leaf,
  ShieldCheck,
  Star,
  MessageSquarePlus,
  ShoppingCart,
  Gavel,
  Loader2,
  Share2,
  Tractor,
  Sprout,
  CheckCircle2,
  LayoutGrid,
  Bell,
  Info
} from "lucide-react";
import cropService from "../services/crop.service";
import notificationService from "../services/notification.service";
import reviewService from "../services/review.service";
import authService from "../services/auth.service";
import NegotiationModal from "../components/marketplace/NegotiationModal";
import ReviewModal from "../components/common/ReviewModal";
import PrimaryButton from "../components/common/PrimaryButton";

const CropDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("buyer");
    const [alertPrice, setAlertPrice] = useState("");
    const [alertSuccess, setAlertSuccess] = useState(false);
    const [isNegotiationModalOpen, setIsNegotiationModalOpen] = useState(false);
    const [negotiationMode, setNegotiationMode] = useState('buy');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        const fetchCropDetails = async () => {
            try {
                const data = await cropService.getCropById(id);
                setCrop(data);

                const userData = authService.getCurrentUser() || {};
                const userId = userData._id || userData.id;

                if (userData.role === "FARMER" || userData.role === "farmer") {
                     if (data.farmer === userId) {
                        setUserRole("owner");
                    } else {
                        setUserRole("farmer");
                    }
                } else {
                    setUserRole("buyer");
                }

                 if (data.farmer) {
                    try {
                        const farmerReviews = await reviewService.getReviewsByUserId(data.farmer);
                        setReviews(farmerReviews);
                    } catch (err) {
                        console.error("Failed to fetch reviews", err);
                        setReviews([]);
                    }
                    setAvgRating(data.farmerRating || 0);
                }
            } catch (err) {
                console.error("Failed to load crop details.", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCropDetails();
    }, [id]);

    const handleSetAlert = async () => {
        if (!alertPrice) return;
        try {
            await notificationService.createPriceAlert(id, alertPrice);
            setAlertSuccess(true);
            setTimeout(() => setAlertSuccess(false), 3000);
            setAlertPrice("");
        } catch (error) {
            console.error("Failed to set alert", error);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-nature-50">
            <Loader2 className="w-12 h-12 text-nature-600 animate-spin" />
        </div>
    );

    if (!crop) return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-nature-50 text-center p-6">
            <div className="glass-panel p-8 rounded-2xl max-w-md w-full">
                <Leaf className="w-16 h-16 text-nature-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-nature-800 mb-2">Crop Not Found</h2>
                <p className="text-nature-600 mb-6">The crop you are looking for does not exist or has been removed.</p>
                <PrimaryButton onClick={() => navigate("/dashboard/marketplace")}>
                    Back to Marketplace
                </PrimaryButton>
            </div>
        </div>
    );

    const isOwner = userRole === "owner";

    return (
        <div className="min-h-screen bg-gradient-to-br from-nature-50 via-nature-100 to-nature-200 p-4 md:p-8 relative overflow-hidden">
             {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-nature-300/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-nature-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Navigation */}
                <button
                    onClick={() => navigate("/dashboard/marketplace")}
                    className="flex items-center gap-2 text-nature-700 hover:text-nature-900 mb-6 transition-colors group"
                >
                    <div className="p-2 bg-white/40 rounded-xl group-hover:bg-white/60 transition-all shadow-sm">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                    <span className="font-bold">Back to Marketplace</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Image & Quick Stats */}
                    <div className="space-y-6">
                        <div className="glass-panel p-2 rounded-3xl overflow-hidden shadow-xl shadow-nature-900/5 relative aspect-square group">
                            {crop.images && crop.images.length > 0 ? (
                                <img
                                    src={crop.images[0]}
                                    alt={crop.name}
                                    className="w-full h-full object-cover rounded-2xl transform group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-nature-100 to-nature-200 flex flex-col items-center justify-center text-nature-400 rounded-2xl relative overflow-hidden">
                                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                    <Leaf className="w-24 h-24 mb-4 opacity-50" />
                                    <span className="font-bold text-lg">No Image Available</span>
                                </div>
                            )}
                            
                            {/* Quality Badge Floating */}
                            <div className="absolute top-6 left-6">
                                <span className={`
                                    px-4 py-1.5 rounded-full text-sm font-bold shadow-lg backdrop-blur-md border border-white/20
                                    ${crop.qualityGrade === 'A' ? 'bg-emerald-500/90 text-white' : 
                                      crop.qualityGrade === 'B' ? 'bg-yellow-500/90 text-white' : 
                                      'bg-orange-500/90 text-white'}
                                `}>
                                    Grade {crop.qualityGrade}
                                </span>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div className="glass-panel p-3 md:p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 md:gap-4 hover:bg-white/60 transition-colors">
                                <div className="p-2 md:p-3 bg-nature-100 text-nature-600 rounded-xl shrink-0">
                                    <Sprout className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs text-nature-500 font-bold uppercase tracking-wider truncate">Quantity</p>
                                    <p className="text-base md:text-lg font-bold text-nature-800 truncate">{crop.quantity} {crop.unit || 'Kg'}</p>
                                </div>
                            </div>
                             <div className="glass-panel p-3 md:p-5 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 md:gap-4 hover:bg-white/60 transition-colors">
                                <div className="p-2 md:p-3 bg-nature-100 text-nature-600 rounded-xl shrink-0">
                                    <LayoutGrid className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] md:text-xs text-nature-500 font-bold uppercase tracking-wider truncate">Variety</p>
                                    <p className="text-base md:text-lg font-bold text-nature-800 truncate">{crop.variety || 'Standard'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Alert Setup */}
                        <div className="glass-panel p-4 md:p-6 rounded-2xl">
                             <div className="flex items-center gap-2 mb-4">
                                <Bell className="w-4 h-4 text-nature-500" />
                                <h3 className="text-xs font-black text-nature-500 uppercase tracking-widest">Price Alert</h3>
                             </div>
                             
                            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                                <div className="flex-1 space-y-1 w-full">
                                    <label className="text-xs font-bold text-nature-600">Notify when price reaches (≥)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-nature-400 font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={alertPrice}
                                            onChange={(e) => setAlertPrice(e.target.value)}
                                            placeholder={crop.finalPrice || crop.basePrice}
                                            className="w-full pl-7 pr-4 py-2.5 bg-nature-50/50 border border-nature-200 rounded-xl focus:ring-2 focus:ring-nature-400 focus:outline-none text-nature-800 font-bold text-sm"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleSetAlert}
                                    className="w-full sm:w-auto px-4 py-2.5 bg-nature-600 hover:bg-nature-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-nature-600/20 mb-[1px]"
                                >
                                    Set
                                </button>
                            </div>
                             {alertSuccess && (
                                <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Alert set successfully!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="space-y-6">
                        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                             {/* Background Decoration */}
                             <div className="absolute top-0 right-0 w-32 h-32 bg-nature-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                            <div className="relative">
                                <div className="flex justify-between items-start mb-2">
                                    <h1 className="text-4xl font-black text-nature-900 tracking-tight">{crop.name}</h1>
                                    <div className="flex items-center gap-2 bg-white/50 px-3 py-1.5 rounded-full border border-white/30 backdrop-blur-sm">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="font-bold text-nature-800">{Number(avgRating).toFixed(1)}</span>
                                        <span className="text-xs text-nature-500">({reviews.length})</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-nature-600 mb-6 text-sm">
                                    <div className="flex items-center gap-1.5 bg-nature-100/50 px-2 py-1 rounded-lg">
                                        <MapPin className="w-4 h-4 text-nature-500" />
                                        <span className="font-bold">
                                            {crop.location?.district || "District"}, {crop.location?.state || "State"}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-nature-100/50 px-2 py-1 rounded-lg">
                                        <Calendar className="w-4 h-4 text-nature-500" />
                                        <span className="font-medium">
                                            Listed {new Date(crop.createdAt || Date.now()).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="prose prose-nature text-nature-700/80 mb-8 leading-relaxed font-medium">
                                    {crop.description || "No description provided by the farmer. Contact the seller for more details about farming practices and crop quality."}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between p-6 bg-nature-50/80 rounded-2xl border border-nature-100 mb-8 shadow-inner">
                                    <div>
                                        <p className="text-xs font-black text-nature-400 uppercase tracking-widest mb-1">Asking Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-nature-800">₹{crop.finalPrice || crop.basePrice}</span>
                                            <span className="text-nature-500 font-bold">/ {crop.unit || 'Kg'}</span>
                                        </div>
                                         {crop.finalPrice !== crop.basePrice && (
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-nature-400 font-bold line-through">₹{crop.basePrice}</span>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest bg-emerald-100 text-emerald-700`}>
                                                   Adjusted Price
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {!isOwner && (
                                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                                            {crop.quantity > 0 ? (
                                                <>
                                                    {userRole === "buyer" && (
                                                        <button 
                                                            onClick={() => {
                                                                setNegotiationMode('negotiate');
                                                                setIsNegotiationModalOpen(true);
                                                            }}
                                                            className="px-5 py-3 rounded-xl border-2 border-nature-200 bg-white/50 text-nature-700 font-bold hover:bg-white hover:border-nature-300 transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <Gavel className="w-5 h-5" />
                                                            Negotiate
                                                        </button>
                                                    )}
                                                    <PrimaryButton 
                                                        onClick={() => {
                                                            setNegotiationMode('buy');
                                                            setIsNegotiationModalOpen(true);
                                                        }}
                                                        className="flex items-center justify-center gap-2 px-8 shadow-lg shadow-nature-600/20"
                                                    >
                                                        <ShoppingCart className="w-5 h-5" />
                                                        {userRole === "buyer" ? "Buy Now" : "Express Interest"}
                                                    </PrimaryButton>
                                                </>
                                            ) : (
                                                 <div className="px-6 py-3 bg-neutral-100 rounded-xl border border-neutral-200 text-neutral-400 font-bold flex items-center gap-2 cursor-not-allowed">
                                                    Out of Stock
                                                 </div>
                                            )}
                                        </div>
                                    )}
                                     {isOwner && (
                                         <PrimaryButton 
                                            onClick={() => navigate(`/dashboard/my-crops/edit/${crop._id}`)}
                                            className="px-8"
                                         >
                                            Edit Listing
                                         </PrimaryButton>
                                     )}
                                </div>

                                <div className="flex items-center gap-3 justify-center text-xs font-bold text-nature-600 uppercase tracking-widest bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                    Verified Secure Transaction
                                </div>
                            </div>
                        </div>

                        {/* Farmer Info */}
                        <div className="glass-panel p-6 rounded-3xl flex items-center justify-between group hover:bg-white/60 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-nature-100 rounded-2xl flex items-center justify-center text-nature-600 font-bold text-xl group-hover:bg-nature-200 transition-colors">
                                    <Tractor className="w-7 h-7" />
                                </div>
                                <div>
                                    <p className="text-xs text-nature-400 font-black uppercase tracking-wider mb-1">Farmer Partner</p>
                                    <h3 className="font-bold text-nature-900 text-lg flex items-center gap-2">
                                        {crop.farmerName || "Verified Farmer"}
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                                    </h3>
                                    <div className="flex items-center gap-1 text-xs text-nature-500 font-medium">
                                       Member since 2023
                                    </div>
                                </div>
                            </div>
                            <button className="p-3 bg-white hover:bg-nature-50 rounded-xl text-nature-600 transition-all shadow-sm border border-nature-100">
                                <MessageSquarePlus className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                 {/* Ratings & Reviews Section */}
                <div className="mt-12 mb-16">
                     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-nature-900 tracking-tight">Ratings & Reviews</h2>
                            <p className="text-nature-500 mt-1 font-medium">Feedback from other buyers</p>
                        </div>
                        
                        {(userRole === "buyer" && !isOwner) && (
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="px-6 py-3 bg-white/40 border border-white/50 text-nature-800 font-bold rounded-2xl hover:bg-white/70 transition-all shadow-sm backdrop-blur-md flex items-center gap-2"
                            >
                                <Star className="w-4 h-4" />
                                Write a Review
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="glass-panel p-6 rounded-3xl hover:bg-white/60 transition-colors">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-nature-100 rounded-2xl flex items-center justify-center text-nature-700 font-bold">
                                                {(review.reviewerName && review.reviewerName[0]) || 'U'}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-nature-900 text-sm">{review.reviewerName || 'Anonymous'}</h4>
                                                <p className="text-xs text-nature-400 font-medium">{new Date(review.date).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-amber-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-nature-200 fill-nature-200"}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-nature-700 text-sm leading-relaxed italic border-l-2 border-nature-200 pl-3">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))
                        ) : (
                             <div className="col-span-full py-16 text-center text-nature-400 bg-white/20 rounded-[2.5rem] border-2 border-dashed border-nature-200/50 backdrop-blur-sm">
                                <Star className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">No reviews yet available for this seller.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <NegotiationModal
                isOpen={isNegotiationModalOpen}
                onClose={() => setIsNegotiationModalOpen(false)}
                crop={crop}
                mode={negotiationMode}
                onSuccess={(result) => {
                    if (negotiationMode === 'buy') {
                        alert("Order placed successfully!");
                        navigate('/dashboard/orders'); 
                    } else {
                        alert("Negotiation started! Check your negotiations tab.");
                        // The result usually contains the new negotiation ID
                        if (result && result._id) {
                             navigate(`/dashboard/negotiations`); // Or specific ID if routes exist
                        } else {
                             navigate(`/dashboard/negotiations`);
                        }
                    }
                }}
            />
            {crop && (
                <ReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    targetId={crop.farmer}
                    onSuccess={() => window.location.reload()}
                />
            )}
        </div>
    );
};

export default CropDetails;
