import React, { useState, useEffect } from "react";
import rotationService from "../../services/rotation.service";
import authService from "../../services/auth.service";
import { LineChart, HandCoins, ArrowRight, RefreshCcw, Droplet, Sprout, BarChart3, Star, Sparkles } from "lucide-react";

const RotationAdvisoryCard = () => {
    const [suggestion, setSuggestion] = useState(null);
    const [lastCrop, setLastCrop] = useState("Rice");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [firstLoad, setFirstLoad] = useState(true);

    const user = authService.getCurrentUser();
    const district = user?.district || "India";

    useEffect(() => {
        if (firstLoad) {
            fetchSuggestion();
            setFirstLoad(false);
        }
    }, [firstLoad]);

    const fetchSuggestion = async () => {
        if (!lastCrop.trim()) return;
        setLoading(true);
        setError(false);
        try {
            const data = await rotationService.getRotationSuggestion(lastCrop, district);
            setSuggestion(data);
        } catch (err) {
            setError(true);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        fetchSuggestion();
    };

    return (
        <div className="bg-white rounded-[2rem] border border-neutral-light shadow-xl overflow-hidden flex flex-col md:flex-row h-full group hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 min-h-[450px]">
            {/* Left Strategy Panel */}
            <div className="md:w-2/5 bg-gradient-to-br from-[#1a1f1b] to-black p-8 flex flex-col justify-between relative overflow-hidden">
                {/* Abstract Background patterns */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/20 blur-[50px] rounded-full -translate-x-1/2 translate-y-1/2" />

                <div className="relative z-20">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full mb-6 border border-white/10">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.15em]">AI Success Strategy</span>
                    </div>

                    <h3 className="text-3xl font-black text-white mb-2 leading-[1.1]">
                        What to <span className="text-primary italic">Plant</span> Next?
                    </h3>

                    <form onSubmit={handleFormSubmit} className="mt-8 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">
                                Your Last Harvest
                            </label>
                            <input
                                type="text"
                                value={lastCrop}
                                onChange={(e) => setLastCrop(e.target.value)}
                                placeholder="e.g. Rice, Wheat, Tomato"
                                className="w-full bg-white/5 border-2 border-white/10 focus:border-primary focus:bg-white/10 rounded-xl px-4 py-3 text-white font-bold text-sm outline-none transition-all"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !lastCrop.trim()}
                            className="w-full py-3 bg-primary hover:bg-green-600 disabled:bg-neutral-light/20 disabled:text-white/20 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <RefreshCcw className="w-4 h-4 animate-spin" /> : "Get AI Suggestion"}
                        </button>
                    </form>
                </div>

                <div className="relative z-10 pt-8 mt-auto border-t border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-primary transition-colors duration-500">
                            <HandCoins className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="block text-[10px] font-black text-primary uppercase tracking-widest">Predicted ROI</span>
                            <span className="text-2xl font-black text-white">{suggestion?.estimatedROI || "--%"}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Information Panel */}
            <div className="md:w-3/5 p-8 flex flex-col justify-between bg-white">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-pulse">
                        <div className="w-12 h-12 bg-neutral-light rounded-2xl" />
                        <div className="h-3 w-32 bg-neutral-light rounded-full" />
                        <div className="h-2 w-24 bg-neutral-light rounded-full" />
                    </div>
                ) : error ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                            <Sprout className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="text-xs font-bold text-accent">Failed to generate AI advice. Please check your crop name and try again.</p>
                        <button onClick={fetchSuggestion} className="text-[10px] font-black text-primary uppercase tracking-widest underline">Retry</button>
                    </div>
                ) : suggestion ? (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h4 className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">Recommended Crop</h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl font-black text-[#1a1f1b]">{suggestion.nextCrop}</span>
                                    <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                                        <Star className="w-3 h-3 text-primary fill-primary" />
                                        <span className="text-[10px] font-black text-primary">{suggestion.profitabilityScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10 hover:border-primary/20 transition-all">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-neutral-light shrink-0">
                                    <Sprout className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest block mb-0.5">Soil Recovery Advantage</span>
                                    <p className="text-xs font-bold text-text-dark leading-relaxed">{suggestion.soilBenefit}</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-neutral-light shrink-0">
                                    <LineChart className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-0.5">Market Opportunity</span>
                                    <p className="text-xs font-bold text-text-dark leading-relaxed">{suggestion.reason}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-neutral-light">
                            <button className="w-full py-4 bg-[#1a1f1b] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-primary transition-all duration-500 shadow-xl shadow-primary/10">
                                View Cultivation Guide
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                        <Sparkles className="w-12 h-12 text-primary opacity-20" />
                        <p className="text-xs font-bold text-accent">Enter your last harvest to see your AI Success Strategy.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RotationAdvisoryCard;
