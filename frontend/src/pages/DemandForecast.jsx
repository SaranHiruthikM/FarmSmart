import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import priceService from "../services/price.service";
import recommendationService from "../services/recommendation.service";
import {
    ArrowDown,
    ArrowUp,
    MapPin,
    Info,
    Zap,
    Clock,
    Lightbulb,
    ChevronRight,
    RefreshCw,
    CheckCircle2,
    BadgeAlert,
    Sprout,
} from "lucide-react";
import PrimaryButton from "../components/common/PrimaryButton";

// Comprehensive static fallback crop list for the selector
const FALLBACK_CROPS = [
    { id: "tomato", name: "Tomato" },
    { id: "onion", name: "Onion" },
    { id: "potato", name: "Potato" },
    { id: "rice", name: "Rice" },
    { id: "wheat", name: "Wheat" },
    { id: "maize", name: "Maize" },
    { id: "cotton", name: "Cotton" },
    { id: "sugarcane", name: "Sugarcane" },
    { id: "groundnut", name: "Groundnut" },
    { id: "soybean", name: "Soybean" },
    { id: "banana", name: "Banana" },
    { id: "mango", name: "Mango" },
    { id: "brinjal", name: "Brinjal" },
    { id: "chilli", name: "Chilli" },
    { id: "cauliflower", name: "Cauliflower" },
    { id: "cabbage", name: "Cabbage" },
    { id: "carrot", name: "Carrot" },
    { id: "garlic", name: "Garlic" },
    { id: "ginger", name: "Ginger" },
    { id: "turmeric", name: "Turmeric" },
    { id: "okra", name: "Okra (Lady Finger)" },
    { id: "peas", name: "Peas" },
    { id: "beans", name: "Beans" },
    { id: "cucumber", name: "Cucumber" },
    { id: "watermelon", name: "Watermelon" },
    { id: "grapes", name: "Grapes" },
    { id: "pomegranate", name: "Pomegranate" },
];

const DemandForecast = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // --- Core data state ---
    const [selectedCrop, setSelectedCrop] = useState("tomato");
    const [location, setLocation] = useState("Coimbatore");
    // Committed location — only updates after debounce / manual refresh
    const [committedLocation, setCommittedLocation] = useState("Coimbatore");

    const [demandData, setDemandData] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [availableCrops, setAvailableCrops] = useState(FALLBACK_CROPS);
    const [loading, setLoading] = useState(true);
    // eslint-disable-next-line no-unused-vars
    const [recsLoading, setRecsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce timer ref for location input
    const debounceRef = useRef(null);

    // -------------------------------------------------------
    // Load crop list on mount — tries API, falls back to static
    // -------------------------------------------------------
    useEffect(() => {
        const loadCrops = async () => {
            try {
                const crops = await priceService.getAvailableCrops(committedLocation);
                if (crops && crops.length > 0) {
                    setAvailableCrops(crops);
                }
                // else keep the FALLBACK_CROPS already set
            } catch {
                // silently keep fallback
            }
        };
        loadCrops();
    }, []); // Only on mount — we don't reload crop list on location change

    // -------------------------------------------------------
    // Main data fetch — runs on: initial load, crop change,
    // committedLocation change (debounced or manual refresh)
    // -------------------------------------------------------
    const fetchData = useCallback(async (crop, loc) => {
        setLoading(true);
        setError(null);
        try {
            const [forecast, recs] = await Promise.all([
                recommendationService.getDemandForecast(crop, loc),
                recommendationService.getCropRecommendations(loc, crop),
            ]);
            setDemandData(forecast);
            setRecommendations(Array.isArray(recs) ? recs.slice(0, 3) : []);
        } catch (err) {
            console.error("Demand fetch error:", err);
            setError("Failed to load demand data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load + re-fetch when committed values change
    useEffect(() => {
        fetchData(selectedCrop, committedLocation);
    }, [selectedCrop, committedLocation, fetchData]);

    // -------------------------------------------------------
    // Crop selector change — instant (no debounce needed)
    // -------------------------------------------------------
    const handleCropChange = (e) => {
        setSelectedCrop(e.target.value);
        // Also update recommendations for the new crop instantly
    };

    // -------------------------------------------------------
    // Location input — debounced (700ms after last keystroke)
    // -------------------------------------------------------
    const handleLocationInput = (e) => {
        const val = e.target.value;
        setLocation(val); // Update display immediately (no flickering)

        // Clear previous timer
        if (debounceRef.current) clearTimeout(debounceRef.current);

        // Only commit + fetch after user stops typing for 700ms
        debounceRef.current = setTimeout(() => {
            if (val.trim().length >= 2) {
                setCommittedLocation(val.trim());
            }
        }, 700);
    };

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    // -------------------------------------------------------
    // Manual Refresh button — commits current location + refetches
    // -------------------------------------------------------
    const handleRefresh = () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const loc = location.trim() || committedLocation;
        setCommittedLocation(loc);
        fetchData(selectedCrop, loc);
    };

    // -------------------------------------------------------
    // Recommendations-only refresh when crop changes
    // (so we don't block the whole page)
    // -------------------------------------------------------
    // const refreshRecommendations = useCallback(async () => {
    //     setRecsLoading(true);
    //     try {
    //         const recs = await recommendationService.getCropRecommendations(committedLocation, selectedCrop);
    //         setRecommendations(Array.isArray(recs) ? recs.slice(0, 3) : []);
    //     } finally {
    //         setRecsLoading(false);
    //     }
    // }, [committedLocation, selectedCrop]);

    // -------------------------------------------------------
    // Render helpers
    // -------------------------------------------------------
    const DemandBadge = ({ level }) => {
        const styles = {
            High: "bg-green-50 text-green-700 border-green-100",
            Medium: "bg-yellow-50 text-yellow-700 border-yellow-100",
            Low: "bg-red-50 text-red-700 border-red-100",
        };
        const dotStyles = {
            High: "bg-green-600",
            Medium: "bg-yellow-600",
            Low: "bg-red-600",
        };
        return (
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border shadow-sm ${styles[level] || styles.Low}`}>
                <div className={`w-2 h-2 rounded-full animate-pulse ${dotStyles[level] || dotStyles.Low}`} />
                <span className="text-sm font-black uppercase tracking-widest">
                    {t(`demandForecast.levels.${level}`, { defaultValue: level })} {t('demandForecast.demand')}
                </span>
            </div>
        );
    };

    const TrendIcon = ({ trend }) => {
        if (trend === "up") return <ArrowUp className="w-6 h-6" />;
        if (trend === "down") return <ArrowDown className="w-6 h-6" />;
        return <RefreshCw className="w-6 h-6" />;
    };

    const trendContainerClass = (trend) => {
        if (trend === "up") return "bg-green-500/20 text-green-400";
        if (trend === "down") return "bg-red-500/20 text-red-400";
        return "bg-blue-500/20 text-blue-400";
    };

    // -------------------------------------------------------
    // Render
    // -------------------------------------------------------
    return (
        <div className="space-y-8 pb-12">
            {/* ── Header + Controls ─────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-neutral-light">
                <div>
                    <h1 className="text-3xl font-black text-text-dark tracking-tight">{t('demandForecast.title')}</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">
                        {t('demandForecast.subtitle')}
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    {/* Crop Selector */}
                    <div className="space-y-1.5 min-w-[200px]">
                        <label htmlFor="crop-select" className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">
                            {t('demandForecast.selectCrop')}
                        </label>
                        <select
                            id="crop-select"
                            value={selectedCrop}
                            onChange={handleCropChange}
                            className="w-full px-4 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark transition-all cursor-pointer"
                        >
                            {availableCrops.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Refresh Button */}
                    <PrimaryButton
                        id="refresh-demand-btn"
                        className="h-[52px] px-8 text-xs font-black uppercase tracking-widest rounded-2xl whitespace-nowrap"
                        onClick={handleRefresh}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        {t('demandForecast.refreshData')}
                    </PrimaryButton>
                </div>
            </div>

            {/* ── Error Banner ──────────────────────────────── */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm font-bold flex items-center gap-3">
                    <BadgeAlert className="w-5 h-5 shrink-0" />
                    {error}
                </div>
            )}

            {/* ── Main Cards ───────────────────────────────── */}
            {loading || !demandData ? (
                <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <p className="text-accent font-bold text-sm uppercase tracking-widest">
                            {t('demandForecast.analyzing')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Market Demand Card */}
                    <div className="bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 bg-primary/5 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">
                                    {t('demandForecast.marketDemand')}
                                </h3>
                                <p className="text-xs text-accent font-bold uppercase tracking-widest">
                                    {availableCrops.find(c => c.id === selectedCrop)?.name || selectedCrop} · {committedLocation}
                                </p>
                            </div>
                            <DemandBadge level={demandData.demandLevel} />
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
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">
                                        {t('demandForecast.activeBuyers')}
                                    </h4>
                                    <p className="text-2xl font-black text-text-dark">
                                        {demandData.metadata?.activeBuyers || 0}
                                        <span className="text-xs text-accent font-medium ml-1">{t('demandForecast.bidding')}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-white border border-neutral-light rounded-2xl space-y-2">
                                    <h4 className="text-[10px] font-black text-accent uppercase tracking-widest">
                                        {t('demandForecast.totalSupply')}
                                    </h4>
                                    <p className="text-2xl font-black text-text-dark">
                                        {demandData.metadata?.totalSupply || 0}
                                        <span className="text-xs text-accent font-medium ml-1">{t('demandForecast.kg')}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Strategy Advice Card */}
                    <div className="bg-gradient-to-br from-text-dark to-neutral-900 p-8 rounded-[2rem] text-white shadow-xl shadow-black/10 flex flex-col h-full relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                            <Clock className="w-40 h-40" />
                        </div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-xl font-black uppercase tracking-tight">{t('demandForecast.strategyAdvice')}</h3>
                                <p className="text-xs opacity-60 font-bold uppercase tracking-widest">
                                    {t('demandForecast.aiGuidance')}
                                </p>
                            </div>
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <Zap className="w-5 h-5 text-yellow-400" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-8 relative z-10">
                            <div className="space-y-2">
                                <span className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">
                                    {t('demandForecast.ourRecommendation')}
                                </span>
                                <div className="flex items-center gap-4">
                                    <h2
                                        className={`text-5xl font-black tracking-tight ${demandData.sellRecommendation?.action === "Sell Now"
                                            ? "text-green-400"
                                            : "text-yellow-400"
                                            }`}
                                    >
                                        {demandData.sellRecommendation?.action || "Wait"}
                                    </h2>
                                    <div
                                        className={`p-2 rounded-xl backdrop-blur-md ${trendContainerClass(
                                            demandData.sellRecommendation?.trend
                                        )}`}
                                    >
                                        <TrendIcon trend={demandData.sellRecommendation?.trend} />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm">
                                <p className="text-sm font-bold leading-relaxed opacity-90">
                                    {demandData.sellRecommendation?.reason}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/dashboard/marketplace")}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-primary/20"
                            >
                                {t('demandForecast.listInventory')}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Crop Recommendations Section ─────────────── */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-text-dark tracking-tight uppercase">
                            {t('demandForecast.suggested')}
                        </h2>
                        <p className="text-accent font-bold uppercase tracking-widest text-[10px] mt-1">
                            {t('demandForecast.basedOn')}{" "}
                            <span className="text-primary">
                                {availableCrops.find((c) => c.id === selectedCrop)?.name || selectedCrop}
                            </span>{" "}
                            crop selection &amp; location
                        </p>
                    </div>

                    {/* Location input — debounced */}
                    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-neutral-light shadow-sm">
                        <MapPin className="w-4 h-4 text-primary ml-2 shrink-0" />
                        <span className="text-[10px] font-black text-accent uppercase tracking-widest whitespace-nowrap">
                            {t('demandForecast.locationLabel')}
                        </span>
                        <input
                            id="location-input"
                            type="text"
                            value={location}
                            onChange={handleLocationInput}
                            onKeyDown={(e) => e.key === "Enter" && handleRefresh()}
                            placeholder={t('demandForecast.enterDistrict')}
                            className="bg-neutral-light/50 px-4 py-2 rounded-xl text-xs font-black text-text-dark border-none focus:ring-2 focus:ring-primary outline-none min-w-[160px]"
                        />
                    </div>
                </div>

                {recsLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-accent font-bold uppercase tracking-widest">
                                {t('demandForecast.gettingRecommendations')}
                            </p>
                        </div>
                    </div>
                ) : recommendations.length === 0 ? (
                    <div className="bg-neutral-light/30 rounded-3xl p-10 text-center">
                        <Sprout className="w-10 h-10 text-primary mx-auto mb-3" />
                        <p className="text-accent font-bold text-sm">
                            {t('demandForecast.noRecommendationsYet')}{" "}
                            <strong>{t('demandForecast.refreshData')}</strong>{" "}
                            {t('demandForecast.afterEnteringLocation')}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((rec, idx) => (
                            <div
                                key={idx}
                                className="bg-white p-6 rounded-[2rem] border border-neutral-light shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                                        <Lightbulb className="w-6 h-6" />
                                    </div>
                                    <div className="px-3 py-1 bg-green-50 text-green-700 text-[10px] font-black rounded-full border border-green-100 flex items-center gap-1.5 uppercase tracking-widest">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {t(`demandForecast.suitability.${rec.suitability}`, { defaultValue: rec.suitability })} {t('demandForecast.fit')}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="text-xl font-black text-text-dark">{rec.name}</h4>
                                        <p className="text-xs text-accent font-bold uppercase tracking-widest">
                                            {t('demandForecast.potentialProfit')} <span className="text-primary font-black">+18%</span>
                                        </p>
                                    </div>
                                    <p className="text-xs text-accent font-medium leading-relaxed italic border-l-4 border-primary/20 pl-3">
                                        "{rec.reason}"
                                    </p>
                                    <button className="w-full py-3 bg-neutral-light/50 text-text-dark text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all">
                                        {t('demandForecast.viewGrowthPlan')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Accessibility Tip ─────────────────────────── */}
            <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-blue-100 shrink-0">
                    <BadgeAlert className="w-10 h-10 text-blue-500" />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="font-black text-blue-900 uppercase tracking-widest text-sm">{t('demandForecast.needHelp')}</h4>
                    <p className="text-xs text-blue-700 font-bold leading-relaxed">
                        {t('demandForecast.helpText')}
                    </p>
                </div>
            </div>
        </div >
    );
};

export default DemandForecast;
