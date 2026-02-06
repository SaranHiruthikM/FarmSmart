import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cropService from "../services/crop.service";
import { Loader2, ArrowLeft, MapPin, BadgeIndianRupee, Share2, ShieldCheck, Scale, User, Calendar, Info } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";
import mockReviewService from "../services/review.mock";
import { Star, CheckCircle, Award } from "lucide-react";

const CropDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState("buyer"); // In real app, get from auth context
    const [reviews, setReviews] = useState([]);
    const [avgRating, setAvgRating] = useState(0);

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                const data = await cropService.getCropById(id);
                setCrop(data);

                const userData = JSON.parse(localStorage.getItem("user") || "{}");
                // Backend uses _id, mock used id. Support both.
                const userId = userData._id || userData.id;

                if (userData.role === "FARMER" || userData.role === "farmer") { // Check both case just in case
                    if (data.farmer === userId) {
                        setUserRole("owner");
                    } else {
                        setUserRole("farmer");
                    }
                } else {
                    setUserRole("buyer");
                }

                // Fetch reviews for the farmer
                if (data.farmer) {
                    const farmerReviews = mockReviewService.getReviewsByUserId(data.farmer);
                    setReviews(farmerReviews);
                    setAvgRating(mockReviewService.getAverageRating(data.farmer));
                }
            } catch (error) {
                console.error("Failed to load crop", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCrop();
    }, [id]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="animate-spin text-primary w-12 h-12" />
            <p className="text-accent font-medium animate-pulse">Fetching crop details...</p>
        </div>
    );

    if (!crop) return (
        <div className="text-center py-32 space-y-6">
            <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-text-dark">Crop Not Found</h3>
                <p className="text-accent">The crop listing you are looking for might have been removed or is unavailable.</p>
            </div>
            <button
                onClick={() => navigate("/dashboard/marketplace")}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg"
            >
                Back to Marketplace
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate("/dashboard/marketplace")}
                className="group flex items-center text-accent hover:text-primary transition-all font-medium mb-8"
            >
                <div className="bg-white p-2 rounded-lg border border-neutral-light group-hover:border-primary/30 mr-3 transition-colors shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Marketplace
            </button>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-neutral-light overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Visual & Seller Info */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 relative flex flex-col items-center justify-center p-8 lg:p-14 border-r border-neutral-light/50">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <span className="text-9xl transform hover:scale-110 transition-transform duration-500 cursor-default z-10">🌾</span>

                        {/* Farmer Info Box */}
                        <div className="mt-12 w-full bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white z-10 shadow-sm">
                            <h3 className="text-xs font-black text-accent uppercase tracking-widest mb-4 flex items-center">
                                <User className="w-3 h-3 mr-2" /> Seller Information
                            </h3>
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-black mr-4">
                                    {crop.farmerName?.[0] || 'F'}
                                </div>
                                <div>
                                    <p className="font-black text-text-dark">{crop.farmerName || 'Farmer Partner'}</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <p className="text-xs text-accent font-medium">Verified Farmer Since 2023</p>
                                        <div className="flex items-center bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100">
                                            <Award className="w-2.5 h-2.5 mr-1" /> Top Rated
                                        </div>
                                        <div className="flex items-center bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-green-100">
                                            <CheckCircle className="w-2.5 h-2.5 mr-1" /> Verified
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-accent shadow-sm border border-white/50 z-10 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Listed {new Date(crop.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                    </div>

                    {/* Right: Details & Actions */}
                    <div className="p-8 lg:p-14 space-y-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <h1 className="text-4xl font-black text-text-dark tracking-tight">{crop.name}</h1>
                                    <p className="text-xl text-accent font-medium">{crop.variety || 'Standard Variety'}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-sm font-black shadow-sm flex items-center gap-2 ${crop.qualityGrade === 'A' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    crop.qualityGrade === 'B' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                        'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    <ShieldCheck className="w-4 h-4" />
                                    GRADE {crop.qualityGrade}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-neutral-light/50">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Market Price / {crop.unit}</p>
                                <div className="flex flex-col">
                                    <div className="flex items-baseline text-4xl font-black text-primary">
                                        <span className="text-2xl mr-0.5">₹</span>
                                        {crop.finalPrice || crop.basePrice}
                                        <span className="text-lg text-accent font-medium ml-1">/{crop.unit}</span>
                                    </div>
                                    {crop.finalPrice !== crop.basePrice && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-accent font-bold line-through">₹{crop.basePrice}</span>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${crop.qualityGrade === 'A' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {crop.qualityGrade === 'A' ? '+15% Grade A Bonus' : '-10% Grade C Adjustment'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Available Stock</p>
                                <div className="flex items-center text-3xl font-black text-text-dark">
                                    {crop.quantity}
                                    <span className="text-lg text-accent font-medium ml-2 uppercase">{crop.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-black text-accent uppercase tracking-widest">Location Info</h3>
                                <div className="flex items-center text-primary text-xs font-bold gap-1">
                                    <Info className="w-3.5 h-3.5" /> Exact Location shared on deal
                                </div>
                            </div>
                            <div className="flex items-start p-5 bg-neutral-light/30 rounded-2xl border border-neutral-light/50 group transition-colors hover:border-primary/20">
                                <div className="bg-red-50 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-black text-text-dark text-lg">{crop.location?.district}, {crop.location?.state}</p>
                                    <p className="text-accent font-medium text-sm">{crop.location?.village || 'Village Area'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            {userRole === "owner" ? (
                                <div className="flex-1 flex gap-4">
                                    <PrimaryButton
                                        className="flex-1 py-4 text-lg"
                                        onClick={() => navigate(`/dashboard/my-crops/edit/${crop._id}`)}
                                    >
                                        Edit Listing
                                    </PrimaryButton>
                                    <button
                                        className="px-6 py-4 bg-white border-2 border-primary text-primary font-black rounded-2xl hover:bg-primary/5 transition-all"
                                        onClick={() => {/* Trigger update quantity modal */ }}
                                    >
                                        Update Stock
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1">
                                    <PrimaryButton
                                        className="w-full py-4 text-lg"
                                        onClick={() => alert("Interest noted! Farmer will be notified.")}
                                    >
                                        {userRole === "buyer" ? "Contact Farmer" : "Express Interest"}
                                    </PrimaryButton>
                                </div>
                            )}
                            <button className="p-4 border border-neutral-light rounded-2xl hover:bg-neutral-light hover:text-primary transition-all shadow-sm group">
                                <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100 justify-center">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <ShieldCheck className="w-4 h-4 text-green-700" />
                            </div>
                            <span className="text-[10px] font-black text-green-800 uppercase tracking-[0.2em]">Verified Secure Listing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ratings & Reviews Section */}
            <div className="mt-12 space-y-8 pb-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-text-dark tracking-tight italic">Ratings & Reviews</h2>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-primary text-white px-3 py-1 rounded-xl text-lg font-black">
                                <Star className="w-5 h-5 mr-1.5 fill-white" />
                                {avgRating}
                            </div>
                            <p className="text-accent font-bold uppercase tracking-widest text-xs">Based on {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reviews.length > 0 ? (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white p-6 rounded-3xl border-2 border-neutral-light shadow-sm space-y-4 hover:border-primary/20 transition-all group">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-neutral-light rounded-2xl flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-colors">
                                            {review.reviewerName[0]}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-dark flex items-center gap-2">
                                                {review.reviewerName}
                                                <span className="text-[9px] bg-neutral-light text-accent px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">{review.reviewerRole}</span>
                                            </h4>
                                            <p className="text-xs text-accent font-medium">{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex text-primary">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary" : "text-neutral-light"}`} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-text-dark font-medium leading-relaxed italic text-sm">
                                    "{review.comment}"
                                </p>
                            </div>
                        ))
                    ) : (
                        <div className="lg:col-span-2 bg-neutral-light/30 p-12 rounded-[2.5rem] border-2 border-dashed border-neutral-light text-center space-y-4">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-accent shadow-sm">
                                <Star className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-text-dark tracking-tight">No Reviews Yet</h3>
                                <p className="text-accent font-medium max-w-md mx-auto">Be the first to review this seller's produce after your first successful transaction!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropDetails;
