import { useState, useEffect, useMemo, useRef } from "react";
import priceService from "../services/price.service";
import {
    TrendingUp,
    ArrowDown,
    ArrowUp,
    MapPin,
    Info,
    BarChart3,
    Search,
    Bell,
    Sparkles,
    BrainCircuit,
    X,
    Loader2,
    Send,
    Bot,
    User,
    Globe,
    Leaf,
    ChevronDown
} from "lucide-react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PriceInsights = () => {
    // Selection States
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedCrop, setSelectedCrop] = useState("");

    // List States
    const [statesList, setStatesList] = useState([]);
    const [districtsList, setDistrictsList] = useState([]);
    const [availableCrops, setAvailableCrops] = useState([]);

    // UI States
    const [timeFilter, setTimeFilter] = useState("30"); // Default 30 days

    // Dropdown UI
    const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
    const districtInputRef = useRef(null);

    // Filter districts based on input for search
    const filteredDistricts = useMemo(() => {
        if (!selectedDistrict) return districtsList;
        // Search logic
        return districtsList.filter(d =>
            d.toLowerCase().includes(selectedDistrict.toLowerCase())
        );
    }, [selectedDistrict, districtsList]);

    // Data States
    const [currentPrices, setCurrentPrices] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [isSimulatedData, setIsSimulatedData] = useState(false);
    const [aiAnalysis, setAiAnalysis] = useState("");
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);

    // AI Forecast states
    const [forecastResult, setForecastResult] = useState("");
    const [isForecastLoading, setIsForecastLoading] = useState(false);
    const [showForecast, setShowForecast] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { role: 'assistant', content: "Namaste! I'm your FarmSmart AI Advisor. I see you've already selected your crop and location. Please enter a month and year (e.g., 'December 2026') to predict the price!" }
    ]);
    const [userQuery, setUserQuery] = useState("");




    // 1. Load States on Mount
    useEffect(() => {
        const init = async () => {
            const states = await priceService.getStates();
            setStatesList(states);

            // Auto-select Tamil Nadu if available, else first
            const defaultState = states.find(s => s === "Tamil Nadu") || (states.length > 0 ? states[0] : "");
            if (defaultState) {
                setSelectedState(defaultState);
            }
        };
        init();
    }, []);

    // 2. Load Districts when State Changes
    useEffect(() => {
        const loadDistricts = async () => {
            if (!selectedState) return;
            const districts = await priceService.getDistricts(selectedState);
            setDistrictsList(districts);
            // Clear dependant fields
            setSelectedDistrict("");
            setAvailableCrops([]);
            setSelectedCrop("");
        };
        loadDistricts();
    }, [selectedState]);

    // 3. Load Crops when District is Chosen
    // We only fetch crops when we have a valid district selected (exact match from list for safety)
    useEffect(() => {
        const isValidDistrict = districtsList.includes(selectedDistrict);

        if (isValidDistrict) {
            const loadCrops = async () => {
                try {
                    const crops = await priceService.getAvailableCrops(selectedDistrict);
                    setAvailableCrops(crops);
                    // Default to first crop if available
                    if (crops.length > 0) {
                        setSelectedCrop(crops[0].name);
                    } else {
                        setSelectedCrop("");
                    }
                } catch (e) {
                    console.error("Failed to load crops", e);
                }
            };
            loadCrops();
        } else {
            setAvailableCrops([]);
        }
    }, [selectedDistrict, districtsList]);

    // 4. Fetch Insights Data (Only if we have full selection)
    useEffect(() => {
        if (!selectedCrop || !selectedDistrict || !districtsList.includes(selectedDistrict)) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                // Map time selection to CSV range string
                const rangeMap = {
                    "30": "30 days",
                    "180": "6 month",
                    "365": "year"
                };

                // Fetch Gov API data for Current and Comparison
                // Fetch CSV Dataset data for Historical Trends (Visualizer)
                const [cur, hist, comp] = await Promise.all([
                    priceService.getCurrentPrices(selectedCrop, selectedDistrict),
                    priceService.getCsvHistoricalTrends(selectedCrop, rangeMap[timeFilter] || "30 days"),
                    priceService.getComparison(selectedCrop, selectedDistrict)
                ]);

                if (cur && cur.regionalVariations) {

                    setCurrentPrices(cur.regionalVariations.map(p => ({
                        mandi: p.mandi,
                        pricePerKg: p.price,
                        location: p.location
                    })));
                } else if (Array.isArray(cur)) {
                    setCurrentPrices(cur);
                } else {
                    setCurrentPrices([]);
                }

                if (hist && hist.points) {
                    setIsSimulatedData(hist.isSimulated || false);
                    setHistoryData(hist.points.map(p => ({
                        date: p.date,
                        pricePerKg: p.price
                    })));
                } else if (Array.isArray(hist)) {
                    setHistoryData(hist);
                    setIsSimulatedData(false);
                } else {
                    setHistoryData([]);
                    setIsSimulatedData(false);
                }


                setComparisonData(comp);

                // Fetch AI Market Analysis (Dynamic)
                if (hist && hist.points && hist.points.length > 0) {
                    const timelineStr = rangeMap[timeFilter] || "30 days";
                    priceService.getAiAnalysis(selectedCrop, timelineStr, hist.points.map(p => ({
                        date: p.date,
                        price: p.price
                    }))).then(analysis => {
                        if (analysis) setAiAnalysis(analysis);
                    });
                } else {
                    setAiAnalysis("");
                }
            } catch (err) {

                console.error("Failed to fetch price insights:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchData, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedCrop, selectedDistrict, timeFilter]);

    const handleAskAI = () => {
        setShowForecast(true);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!userQuery.trim() || isForecastLoading) return;
        if (!selectedCrop || !selectedDistrict || !stats.avg) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Please select a crop and district to ask about prices." }]);
            return;
        }

        const currentQuery = userQuery;
        setUserQuery("");
        setChatMessages(prev => [...prev, { role: 'user', content: currentQuery }]);
        setIsForecastLoading(true);

        try {
            const result = await priceService.getForecast(
                selectedCrop,
                selectedDistrict,
                stats.avg,
                currentQuery
            );
            setChatMessages(prev => [...prev, { role: 'assistant', content: result || "I'm having trouble analyzing that. Try again?" }]);
        } catch (err) {
            console.error("Inquiry failed", err);
            setChatMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to AI. Please check your connection." }]);
        } finally {
            setIsForecastLoading(false);
        }
    };


    // Close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (districtInputRef.current && !districtInputRef.current.contains(event.target)) {
                setIsDistrictDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    // Computed Statistics (Memoized)
    const stats = useMemo(() => {
        if (!currentPrices.length) return { avg: 0, min: 0, max: 0, bestMandi: "N/A" };

        const prices = currentPrices.map(p => p.pricePerKg);
        const sum = prices.reduce((a, b) => a + b, 0);
        const avg = (sum / prices.length).toFixed(2);
        const min = Math.min(...prices);
        const max = Math.max(...prices);

        // If we have comparison data use it, otherwise fallback to finding max price mandi
        const bestMandiName = comparisonData?.bestPriceHighlight?.mandi ||
            currentPrices.find(p => p.pricePerKg === max)?.mandi || "N/A";

        return { avg, min, max, bestMandi: bestMandiName };
    }, [currentPrices, comparisonData]);

    const chartData = {
        labels: historyData.map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: `Price of ${selectedCrop} (₹/kg)`,
                data: historyData.map(h => h.pricePerKg),
                borderColor: '#166534',
                backgroundColor: 'rgba(22, 101, 52, 0.1)',
                fill: true,
                tension: 0.3, // Slightly smoother curve
                pointRadius: historyData.length > 20 ? 2 : 4, // Smaller points for dense data
                pointBackgroundColor: '#166534',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                spanGaps: true // Important for sparse data
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a2e1d',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                borderRadius: 12,
                displayColors: false,
                callbacks: {
                    label: (context) => `Avg Price: ₹${context.raw}/kg`
                }
            }
        },
        scales: {
            y: {
                beginAtZero: false, // Better to show variation unless 0 is relevant
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#8CA38D', font: { weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: '#8CA38D',
                    font: { weight: 'bold' },
                    maxTicksLimit: 8 // Limit x-axis labels to prevent overcrowding
                }
            }
        }
    };

    if (loading && !currentPrices.length && !historyData.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-secondary font-bold animate-pulse">Fetching Market Insights...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with Selectors */}
            <div className="flex flex-col gap-6 bg-white p-8 rounded-2xl shadow-sm border border-neutral-light/50 relative group">
                {/* Decorative background clipped to card corners */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 p-16 opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
                        <BrainCircuit className="w-64 h-64 rotate-12 text-primary" />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-primary rounded-full"></div>
                            <h1 className="text-3xl font-bold text-[#1a1f1b]">Market Insights</h1>
                        </div>
                        <p className="text-secondary font-bold uppercase tracking-[0.3em] text-[10px] mt-2 opacity-60 flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                            Live Price Analytics & Predictive Intelligence
                        </p>
                    </div>

                    <button
                        onClick={handleAskAI}
                        disabled={loading || isForecastLoading}
                        className="group flex items-center gap-4 p-6 bg-gradient-to-br from-primary via-green-600 to-green-700 text-white font-bold text-[12px] uppercase tracking-[0.25em] rounded-2xl hover:shadow-[0_20px_40px_-10px_rgba(22,101,52,0.4)] transition-all hover:-translate-y-1.5 active:scale-95 disabled:opacity-50 disabled:translate-y-0 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-y-full hover:translate-y-0 transition-transform duration-500"></div>
                        {isForecastLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <BrainCircuit className="w-6 h-6 transition-transform group-hover:rotate-12" />
                        )}
                        PREDICT PRICE
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
                    {/* State Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1">State</label>
                        <div className="relative">
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full pl-11 pr-10 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-text-dark transition-all cursor-pointer text-sm appearance-none"
                            >
                                <option value="" disabled>Select State</option>
                                {statesList.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                            <Globe className="w-5 h-5 text-accent absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown className="w-4 h-4 text-accent absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                    </div>

                    {/* District Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1">District</label>
                        <div className="relative">
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className={`w-full pl-11 pr-10 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-text-dark transition-all cursor-pointer text-sm appearance-none ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!selectedState}
                            >
                                <option value="" disabled>{selectedState ? "Select District" : "Select State First"}</option>
                                {districtsList.map((d, idx) => (
                                    <option key={idx} value={d}>{d}</option>
                                ))}
                            </select>
                            <MapPin className="w-5 h-5 text-accent absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown className="w-4 h-4 text-accent absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                    </div>

                    {/* Crop Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1">Crop</label>
                        <div className="relative">
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className={`w-full pl-11 pr-10 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-text-dark transition-all cursor-pointer text-sm appearance-none ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!selectedDistrict || availableCrops.length === 0}
                            >
                                {availableCrops.length === 0 ? <option>No crops found</option> : null}
                                {availableCrops.map(c => (
                                    <option key={c.id || c} value={c.name || c}>{c.name || c}</option>
                                ))}
                            </select>
                            <Leaf className="w-5 h-5 text-accent absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown className="w-4 h-4 text-accent absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
                        </div>
                    </div>

                    {/* Range Selectors */}
                    <div className="space-y-1.5 pt-1">
                        <label className="text-[10px] font-bold text-accent uppercase tracking-[0.2em] ml-1">Range</label>
                        <div className="bg-neutral-light/30 p-1.5 rounded-2xl flex items-center gap-1">
                            {["30", "180", "365"].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeFilter(range)}
                                    className={`flex-1 py-2 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${timeFilter === range ? 'bg-white text-primary shadow-sm' : 'text-accent hover:bg-white/50'}`}
                                >
                                    {range === "30" ? "30D" : range === "180" ? "6M" : "1Y"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Advisor Chat Interface */}
            {showForecast && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl h-[600px] rounded-2xl shadow-2xl border border-neutral-light overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-primary via-green-600 to-green-700 p-8 text-white relative">
                            <button
                                onClick={() => setShowForecast(false)}
                                className="absolute top-8 right-8 p-3 bg-white/20 rounded-2xl hover:bg-white/40 transition-all active:scale-90"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-5">
                                <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-md shadow-inner">
                                    <BrainCircuit className="w-9 h-9" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold uppercase tracking-tight">Price Predictor</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        <p className="text-[10px] font-bold text-white/80 uppercase tracking-widest">Random Forest ML + Llama 3.3</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-neutral-light/10 custom-scrollbar">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                                            {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                                        </div>
                                        <div className={`p-5 rounded-[1.5rem] text-sm font-bold leading-relaxed shadow-sm ${msg.role === 'user'
                                            ? 'bg-secondary text-white rounded-tr-none'
                                            : 'bg-white text-text-dark border border-neutral-light rounded-tl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isForecastLoading && (
                                <div className="flex justify-start animate-pulse">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                                            <Bot className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="p-5 bg-white border border-neutral-light rounded-[1.5rem] rounded-tl-none flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Chat Footer */}
                        <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-neutral-light flex gap-4">
                            <input
                                value={userQuery}
                                onChange={(e) => setUserQuery(e.target.value)}
                                placeholder={`Enter date for ${selectedCrop} prediction (e.g. Dec 2026)`}
                                className="flex-1 px-6 py-4 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm transition-all"
                            />
                            <button
                                type="submit"
                                disabled={isForecastLoading || !userQuery.trim()}
                                className="p-4 bg-primary text-white rounded-2xl hover:bg-green-700 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </div>
                </div>
            )
            }


            {/* Price Cards Grid */}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PriceCard
                    label="Today's Avg Price"
                    value={`₹${stats.avg}`}
                    unit="/ kg"
                    icon={TrendingUp}
                    color="text-primary"
                    bg="bg-green-50"
                />
                <PriceCard
                    label="Lowest Price"
                    value={`₹${stats.min}`}
                    unit="/ kg"
                    icon={ArrowDown}
                    color="text-red-500"
                    bg="bg-red-50"
                />
                <PriceCard
                    label="Highest Price"
                    value={`₹${stats.max}`}
                    unit="/ kg"
                    icon={ArrowUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <PriceCard
                    label="Best Market"
                    value={stats.bestMandi}
                    icon={MapPin}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    isText
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                {/* Historical Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-neutral-light shadow-sm flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-bold text-[#1a1f1b]">Price Trend</h3>
                                {isSimulatedData && (
                                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-lg uppercase tracking-widest border border-amber-200">Simulated</span>
                                )}
                            </div>
                            <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1">Market fluctuations over last {timeFilter} days</p>
                        </div>

                        <div className="p-3 bg-neutral-light/30 rounded-2xl">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    {historyData.length > 0 ? (
                        <div className="flex-1 w-full relative">
                            <Line data={chartData} options={chartOptions} />
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-accent opacity-60">
                            <BarChart3 className="w-12 h-12 mb-2" />
                            <p>No historical data available for this range</p>
                        </div>
                    )}

                    <div className="mt-8 relative group overflow-hidden">
                        {/* Premium Glassmorphism Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 rounded-[2rem] ${aiAnalysis ? 'from-primary/10 via-white/5 to-primary/5 border-primary/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]' : 'from-amber-50 to-white border-amber-100 shadow-sm'} border-2`}></div>

                        <div className="relative p-5 md:p-7 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 text-center md:text-left">
                            {/* Smart Icon Container */}
                            <div className={`p-4 rounded-2xl shrink-0 transition-all duration-500 group-hover:rotate-12 ${aiAnalysis ? 'bg-primary/20 text-primary shadow-lg shadow-primary/10' : 'bg-amber-100 text-amber-600'}`}>
                                {aiAnalysis ? (
                                    <div className="relative">
                                        <Sparkles className="w-6 h-6 animate-pulse" />
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-ping"></div>
                                    </div>
                                ) : (
                                    <Info className="w-6 h-6" />
                                )}
                            </div>

                            <div className="space-y-3 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border shadow-sm transition-colors duration-500 ${aiAnalysis
                                        ? 'bg-primary text-white border-primary/20 shadow-primary/20'
                                        : 'bg-amber-100 text-amber-700 border-amber-200'
                                        }`}>
                                        {aiAnalysis ? 'Smart Advisor' : 'Status Notice'}
                                    </span>
                                    {aiAnalysis && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/50 border border-primary/10 rounded-full">
                                            <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                                            <span className="text-[9px] font-bold text-primary/70 uppercase tracking-widest">Llama 3.3 Engine</span>
                                        </div>
                                    )}
                                </div>

                                <p className={`text-[13px] font-bold leading-relaxed tracking-wide transition-all duration-500 ${aiAnalysis ? 'text-gray-800' : 'text-amber-800 italic uppercase'}`}>
                                    {aiAnalysis || (isSimulatedData ? (
                                        "Notice: Real market history for this crop is unavailable; showing simulated trend based on regional averages."
                                    ) : (
                                        <>Market Analysis: Based on current trends, prices for <span className="text-primary font-black">{selectedCrop}</span> are {historyData.length > 1 && historyData[historyData.length - 1].pricePerKg > historyData[0].pricePerKg ? 'RISING' : 'STABLE'}.</>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-sm flex flex-col h-full">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-[#1a1f1b]">Nearby Mandis</h3>
                        <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1">Prices in {selectedDistrict}</p>
                    </div>

                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                        {currentPrices.length > 0 ? currentPrices.map((market, idx) => {
                            const isBest = comparisonData?.bestPriceHighlight ? market.mandi === comparisonData.bestPriceHighlight.mandi : market.pricePerKg === stats.max;

                            return (
                                <div
                                    key={idx}
                                    className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${isBest ? 'border-primary bg-primary/5 shadow-inner' : 'border-neutral-light hover:border-primary/20 bg-white'}`}
                                >
                                    <div className="space-y-1 flex-1 min-w-0 mr-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-text-dark truncate max-w-[150px] md:max-w-full" title={market.mandi}>{market.mandi}</h4>
                                            {isBest && (
                                                <span className="px-2 py-0.5 bg-primary text-[10px] font-black text-white rounded-full uppercase tracking-widest shrink-0">Best</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-[10px] text-accent font-bold uppercase tracking-widest truncate">
                                            <MapPin className="w-3 h-3 mr-1 shrink-0" />
                                            <span className="truncate" title={market.location?.district || selectedDistrict}>{market.location?.district || selectedDistrict}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-lg font-black text-primary">₹{market.pricePerKg}</div>
                                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Per kg</p>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-10 text-accent">
                                <p>No market prices found for {selectedDistrict}.</p>
                                <p className="text-xs mt-2">Try searching a different district.</p>
                            </div>
                        )}
                    </div>

                    <button className="mt-8 w-full flex items-center justify-center gap-2 py-4 bg-text-dark text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-black transition-all group">
                        Notify me of price jumps
                        <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Quick Tips Tooltips (Simplified for Literacy) */}
            <div className="bg-gradient-to-r from-primary to-green-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                    <Info className="w-32 h-32" />
                </div>
                <div className="relative z-10 max-w-xl">
                    <h3 className="text-lg font-black uppercase tracking-widest mb-4">Farmer Tips 🌾</h3>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-bold opacity-90 leading-relaxed">
                                Green lines going up means prices are rising. Good time to sell!
                            </p>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/20 p-2 rounded-xl">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <p className="text-sm font-bold opacity-90 leading-relaxed">
                                Check the "Best Market" card to see where you can get the most money today.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

const PriceCard = ({ label, value, unit, icon: Icon, color, bg, isText = false }) => (
    <div className="bg-white p-6 rounded-2xl border border-neutral-light/50 shadow-sm flex flex-col justify-between space-y-4 h-full transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] group">
        <div className={`w-16 h-16 ${bg} ${color} rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
            <Icon className="w-8 h-8" />
        </div>
        <div>
            <p className="text-[11px] font-bold text-accent/50 uppercase tracking-[0.25em] mb-2">{label}</p>
            <div className="flex items-baseline gap-1.5">
                <span className={`font-bold tracking-tighter ${isText ? 'text-xl text-text-dark line-clamp-1 break-all uppercase italic' : 'text-3xl ' + color}`} title={isText ? value : undefined}>
                    {value}
                </span>
                {!isText && unit && <span className="text-[10px] text-accent font-bold uppercase tracking-widest bg-neutral-light/30 px-2 py-1 rounded-lg ml-1">{unit}</span>}
            </div>
        </div>
    </div>
);

export default PriceInsights;
