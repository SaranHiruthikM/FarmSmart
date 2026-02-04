import { useState, useEffect } from "react";
import priceService from "../services/price.service";
import recommendationService from "../services/recommendation.service";
import {
    TrendingUp,
    ArrowDown,
    ArrowUp,
    MapPin,
    Info,
    Zap,
    Clock,
    Lightbulb,
    ChevronRight,
    Search,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    BadgeAlert
} from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";

const DemandForecast = () => {
    const [selectedCrop, setSelectedCrop] = useState("tomato");
    const [location, setLocation] = useState("Coimbatore");
    const [demandData, setDemandData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [availableCrops, setAvailableCrops] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const crops = await priceService.getAvailableCrops();
                setAvailableCrops(crops);
            } catch (err) {
                console.error(err);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [forecast, recs] = await Promise.all([
                    recommendationService.getDemandForecast(selectedCrop),
                    recommendationService.getCropRecommendations(location)
                ]);
                setDemandData(forecast);
                setRecommendations(recs);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCrop, location]);

    if (loading || !demandData) return <div className="p-10 text-center">Analysing Market Trends...</div>;

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with Crop Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-neutral-light">
                <div>
                    <h1 className="text-3xl font-black text-text-dark tracking-tight">Demand & Recommendations</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">Smart insights for better farming decisions.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-1.5 min-w-[200px]">
                        <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">Select Crop</label>
                        <select
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark transition-all cursor-pointer"
                        >
                            {availableCrops.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <PrimaryButton
                        className="h-[52px] px-8 text-xs font-black uppercase tracking-widest rounded-2xl whitespace-nowrap"
                        onClick={() => { }}
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
                    </PrimaryButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Demand Insight Card */}
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full relative overflow-hidden group">
                    <div className="absolute -top-4 -right-4 bg-primary/5 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">Market Demand</h3>
                            <p className="text-xs text-accent font-bold uppercase tracking-widest">Current stock requirements</p>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm ${demandData.demandLevel === 'High' ? 'bg-green-50 text-green-700 border-green-100' :
                            demandData.demandLevel === 'Medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                'bg-red-50 text-red-700 border-red-100'
                            }`}>
                            <div className={`w-2 h-2 rounded-full animate-pulse ${demandData.demandLevel === 'High' ? 'bg-green-600' :
                                demandData.demandLevel === 'Medium' ? 'bg-yellow-600' :
                                    'bg-red-600'
                                }`}></div>
                            <span className="text-sm font-black uppercase tracking-widest">{demandData.demandLevel} Demand</span>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6 relative z-10">
                        <div className="p-6 bg-neutral-light/30 rounded-2xl border border-neutral-light/50">
                            <div className="flex items-start gap-4">
                                <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                                <p className="text-sm font-bold text-text-dark leading-relaxed">
                                    {demandData.explanation}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white border border-neutral-light rounded-2xl space-y-2">
                                <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">Active Buyers</h4>
                                <p className="text-2xl font-black text-text-dark">24 <span className="text-xs text-accent font-medium ml-1">Bidding</span></p>
                            </div>
                            <div className="p-4 bg-white border border-neutral-light rounded-2xl space-y-2">
                                <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">Region</h4>
                                <p className="text-2xl font-black text-text-dark">Kovai <span className="text-xs text-accent font-medium ml-1">Belt</span></p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Time to Sell Card */}
                <div className="bg-gradient-to-br from-text-dark to-neutral-900 p-8 rounded-[2rem] text-white shadow-xl shadow-black/10 flex flex-col h-full relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                        <Clock className="w-40 h-40" />
                    </div>

                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">Strategy Advice</h3>
                            <p className="text-xs opacity-60 font-bold uppercase tracking-widest">AI Assisted Stock Guidance</p>
                        </div>
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                            <Zap className="w-5 h-5 text-yellow-400" />
                        </div>
                    </div>

                    <div className="flex-1 space-y-8 relative z-10">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">Our Recommendation</span>
                            <div className="flex items-center gap-4">
                                <h2 className={`text-5xl font-black tracking-tight ${demandData.sellRecommendation.action === 'Sell Now' ? 'text-green-400' : 'text-yellow-400'
                                    }`}>
                                    {demandData.sellRecommendation.action}
                                </h2>
                                <div className={`p-2 rounded-xl backdrop-blur-md ${demandData.sellRecommendation.trend === 'up' ? 'bg-green-500/20 text-green-400' :
                                    demandData.sellRecommendation.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                                        'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {demandData.sellRecommendation.trend === 'up' ? <ArrowUp className="w-6 h-6" /> :
                                        demandData.sellRecommendation.trend === 'down' ? <ArrowDown className="w-6 h-6" /> :
                                            <RefreshCw className="w-6 h-6" />}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <p className="text-sm font-bold leading-relaxed opacity-90">
                                {demandData.sellRecommendation.reason}
                            </p>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-primary/20">
                            List my inventory
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Crop Recommendations Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-text-dark tracking-tight uppercase">Suggested for Next Season</h2>
                        <p className="text-accent font-bold uppercase tracking-widest text-[10px] mt-1">Based on location and market forecasts</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-light shadow-sm">
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest ml-3">Location:</span>
                        <select
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="bg-neutral-light/50 px-4 py-2 rounded-xl text-xs font-black text-text-dark border-none focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                        >
                            <option value="Coimbatore">Coimbatore, TN</option>
                            <option value="Nashik">Nashik, MH</option>
                            <option value="Amritsar">Amritsar, PB</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-neutral-light shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                    <Lightbulb className="w-6 h-6" />
                                </div>
                                <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100 flex items-center gap-1.5 uppercase tracking-widest">
                                    <CheckCircle2 className="w-3 h-3" />
                                    {rec.suitability} Fit
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h4 className="text-xl font-black text-text-dark">{rec.name}</h4>
                                    <p className="text-xs text-accent font-bold uppercase tracking-widest">Potential Profit: <span className="text-primary font-black">+18%</span></p>
                                </div>
                                <p className="text-xs text-accent font-medium leading-relaxed italic border-l-4 border-primary/20 pl-3">
                                    "{rec.reason}"
                                </p>
                                <button className="w-full py-3 bg-neutral-light/50 text-text-dark text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">
                                    View Growth Plan
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Accessibility Tip for Low Literacy */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 shrink-0">
                    <BadgeAlert className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="font-black text-blue-900 uppercase tracking-widest text-sm">Need Help? 📢</h4>
                    <p className="text-xs text-blue-700 font-bold leading-relaxed">
                        🟢 Green lights mean HIGH demand. 🔴 Red lights mean wait for better prices. Use the location selector to see what crops grow best in your area next month!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default DemandForecast;
