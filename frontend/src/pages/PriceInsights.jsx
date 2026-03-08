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
    Bell
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
    const [comparisonData, setComparisonData] = useState(null);
    const [loading, setLoading] = useState(false);
    
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
                // Fetch all data in parallel
                const [cur, hist, comp] = await Promise.all([
                    priceService.getCurrentPrices(selectedCrop, selectedDistrict),
                    priceService.getHistoricalTrends(selectedCrop, selectedDistrict, parseInt(timeFilter) || 30),
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
                    setHistoryData(hist.points.map(p => ({
                        date: p.date,
                        pricePerKg: p.price
                    })));
                } else if (Array.isArray(hist)) {
                    setHistoryData(hist);
                } else {
                    setHistoryData([]);
                }

                setComparisonData(comp);
            } catch (err) {
                console.error("Failed to fetch price insights:", err);
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchData, 500);
        return () => clearTimeout(timeoutId);
    }, [selectedCrop, selectedDistrict, timeFilter]);

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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-neutral-light">
                <div className="space-y-4 flex-1">
                    <div>
                        <h1 className="text-3xl font-black text-text-dark tracking-tight">Market Insights</h1>
                        <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">Real-time price comparisons & historical trends.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* State Dropdown (New) */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">State</label>
                            <select
                                value={selectedState}
                                onChange={(e) => setSelectedState(e.target.value)}
                                className="w-full px-4 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark transition-all cursor-pointer text-sm"
                            >
                                <option value="" disabled>Select State</option>
                                {statesList.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* District Searchable Dropdown */}
                        <div className="space-y-1.5 relative" ref={districtInputRef}>
                            <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">District</label>
                            <div className="relative">
                                <input
                                    className={`w-full px-11 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark placeholder:text-accent/30 transition-all cursor-pointer ${!selectedState ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    placeholder={selectedState ? "Select District" : "Select State First"}
                                    value={selectedDistrict}
                                    onChange={(e) => {
                                        setSelectedDistrict(e.target.value);
                                        setIsDistrictDropdownOpen(true);
                                    }}
                                    onFocus={() => selectedState && setIsDistrictDropdownOpen(true)}
                                    disabled={!selectedState}
                                />
                                <MapPin className="w-5 h-5 text-accent absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                            
                            {/* Autocomplete Dropdown */}
                            {isDistrictDropdownOpen && selectedState && (
                                <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl shadow-xl border border-neutral-light max-h-60 overflow-y-auto custom-scrollbar">
                                    {filteredDistricts.length > 0 ? (
                                        filteredDistricts.map((district, idx) => (
                                            <div
                                                key={idx}
                                                className="px-4 py-3 hover:bg-neutral-light/30 cursor-pointer font-bold text-text-dark text-sm border-b border-neutral-light/30 last:border-0"
                                                onClick={() => {
                                                    setSelectedDistrict(district);
                                                    setIsDistrictDropdownOpen(false);
                                                }}
                                            >
                                                {district}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-3 text-accent text-sm font-bold">No districts found</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Crop Dropdown */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">Crop</label>
                            <select
                                value={selectedCrop}
                                onChange={(e) => setSelectedCrop(e.target.value)}
                                className={`w-full px-4 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark transition-all cursor-pointer ${!selectedDistrict ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={!selectedDistrict || availableCrops.length === 0}
                            >
                                {availableCrops.length === 0 ? <option>No crops found</option> : null}
                                {availableCrops.map(c => (
                                    <option key={c.id || c} value={c.name || c}>{c.name || c}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-neutral-light/30 rounded-2xl border border-neutral-light/50">
                    {[
                        { label: '30d', value: '30' },
                        { label: '6m', value: '180' },
                        { label: '1y', value: '365' }
                    ].map(period => (
                        <button
                            key={period.value}
                            onClick={() => setTimeFilter(period.value)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeFilter === period.value ? 'bg-white text-primary shadow-sm border border-neutral-light' : 'text-accent hover:text-text-dark'}`}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

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
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">Price Trend</h3>
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

                    <div className="mt-6 p-4 bg-green-50/50 rounded-2xl border border-green-100/50 flex items-start gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-green-800 font-bold leading-relaxed uppercase tracking-wider">
                            Market Analysis: Based on current trends, prices for <span className="text-primary font-black">{selectedCrop}</span> are {historyData.length > 1 && historyData[historyData.length-1].pricePerKg > historyData[0].pricePerKg ? 'RISING' : 'STABLE'}.
                        </p>
                    </div>
                </div>

                {/* Mandi Comparison */}
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">Nearby Mandis</h3>
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
                    <h3 className="text-xl font-black uppercase tracking-widest mb-4">Farmer Tips 🌾</h3>
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
        </div>
    );
};

const PriceCard = ({ label, value, unit, icon: Icon, color, bg, isText = false }) => (
    <div className="bg-white p-6 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col justify-between space-y-4 h-full transition-all hover:shadow-md hover:translate-y-[-2px] group">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 mb-2`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`font-black tracking-tight ${isText ? 'text-xl text-text-dark line-clamp-1 break-all' : 'text-3xl ' + color}`} title={isText ? value : undefined}>
                    {value}
                </span>
                {!isText && unit && <span className="text-xs text-accent font-bold uppercase">{unit}</span>}
            </div>
        </div>
    </div>
);

export default PriceInsights;
