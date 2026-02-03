import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import cropService from "../services/crop.service";
import { Loader2, ArrowLeft, MapPin, BadgeIndianRupee, Share2, ShieldCheck, Scale } from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";

const CropDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [crop, setCrop] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCrop = async () => {
            try {
                const data = await cropService.getCropById(id);
                setCrop(data);
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
                onClick={() => navigate("/marketplace")}
                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl hover:bg-green-600 transition shadow-lg"
            >
                Back to Marketplace
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-6">
            <button
                onClick={() => navigate("/marketplace")}
                className="group flex items-center text-accent hover:text-primary transition-all font-medium mb-8"
            >
                <div className="bg-white p-2 rounded-lg border border-neutral-light group-hover:border-primary/30 mr-3 transition-colors shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                </div>
                Back to Marketplace
            </button>

            <div className="bg-white rounded-[2rem] shadow-xl shadow-black/5 border border-neutral-light overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                    {/* Left: Image Placeholder */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 h-[400px] lg:h-auto flex items-center justify-center text-primary/20 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <span className="text-9xl transform hover:scale-110 transition-transform duration-500 cursor-default">🌾</span>
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-accent shadow-sm border border-white/50">
                            Listed {new Date(crop.createdAt || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                        {crop.qualityGrade === 'A' && (
                            <div className="absolute top-6 right-6 bg-yellow-400/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-white shadow-sm flex items-center gap-1">
                                PREMIUM GRADE
                            </div>
                        )}
                    </div>

                    {/* Right: Details */}
                    <div className="p-8 lg:p-14 space-y-10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <h1 className="text-4xl font-black text-text-dark tracking-tight">{crop.name}</h1>
                                    <p className="text-xl text-accent font-medium">{crop.variety}</p>
                                </div>
                                <div className={`px-4 py-2 rounded-2xl text-sm font-black shadow-sm ${crop.qualityGrade === 'A' ? 'bg-green-50 text-green-700 border border-green-100' :
                                    crop.qualityGrade === 'B' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-red-50 text-red-700 border border-red-100'
                                    }`}>
                                    GRADE {crop.qualityGrade}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-8 border-y border-neutral-light/50">
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Price per {crop.unit}</p>
                                <div className="flex items-baseline text-4xl font-black text-primary">
                                    <span className="text-2xl mr-0.5">₹</span>
                                    {crop.basePrice}
                                    <span className="text-lg text-accent font-medium ml-1">/{crop.unit}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-accent uppercase tracking-widest">Stock Available</p>
                                <div className="flex items-center text-3xl font-black text-text-dark">
                                    {crop.quantity}
                                    <span className="text-lg text-accent font-medium ml-2 uppercase">{crop.unit}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-black text-text-dark uppercase tracking-widest">Farm Location</h3>
                                <button className="text-primary text-xs font-bold hover:underline">View on Map</button>
                            </div>
                            <div className="flex items-start p-5 bg-neutral-light/30 rounded-2xl border border-neutral-light/50 group transition-colors hover:border-primary/20">
                                <div className="bg-red-50 p-3 rounded-xl mr-4 group-hover:scale-110 transition-transform">
                                    <MapPin className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <p className="font-black text-text-dark text-lg">{crop.location?.village || 'Not specified'}</p>
                                    <p className="text-accent font-medium">{crop.location?.district}, {crop.location?.state}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <div className="flex-1">
                                <PrimaryButton className="w-full py-4 text-lg" onClick={() => alert("Place Bid Feature Coming Soon!")}>
                                    Place a Bid
                                </PrimaryButton>
                            </div>
                            <button className="p-4 border border-neutral-light rounded-2xl hover:bg-neutral-light hover:text-primary transition-all shadow-sm group">
                                <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                            </button>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-green-50/50 rounded-2xl border border-green-100 justify-center">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <ShieldCheck className="w-4 h-4 text-green-700" />
                            </div>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Verified Secure Listing</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CropDetails;
