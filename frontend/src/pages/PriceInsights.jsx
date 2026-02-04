import { useState, useEffect } from "react";
import priceService from "../services/price.service";
import {
    TrendingUp,
    ArrowDown,
    ArrowUp,
    MapPin,
    Info,
    BarChart3,
    Calendar,
    ChevronRight,
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
import { Line, Bar } from 'react-chartjs-2';
import InputField from "../components/common/InputField";

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
    const [selectedCrop, setSelectedCrop] = useState("tomato");
    const [priceData, setPriceData] = useState(null);
    const [availableCrops, setAvailableCrops] = useState([]);
    const [timeFilter, setTimeFilter] = useState("7d");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCrops = async () => {
            const crops = await priceService.getAvailableCrops();
            setAvailableCrops(crops);
        };
        loadCrops();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await priceService.getPriceDataByCrop(selectedCrop);
                setPriceData(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedCrop]);

    if (loading || !priceData) return <div className="p-10 text-center">Loading Insights...</div>;

    const chartData = {
        labels: priceData.historical.map(h => h.date),
        datasets: [
            {
                label: `Price of ${priceData.name} (₹)`,
                data: priceData.historical.map(h => h.price),
                borderColor: '#166534',
                backgroundColor: 'rgba(22, 101, 52, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#166534',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#1a2e1d',
                titleFont: { size: 14, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                borderRadius: 12,
                displayColors: false,
            }
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: { color: 'rgba(0,0,0,0.05)' },
                ticks: { color: '#8CA38D', font: { weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#8CA38D', font: { weight: 'bold' } }
            }
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header section with Selectors */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-6 rounded-3xl shadow-sm border border-neutral-light">
                <div className="space-y-4 flex-1">
                    <div>
                        <h1 className="text-3xl font-black text-text-dark tracking-tight">Market Insights</h1>
                        <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">Real-time price comparisons & historical trends.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
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
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-accent uppercase tracking-[0.2em] ml-1">Location (State/District)</label>
                            <div className="relative">
                                <input
                                    className="w-full px-11 py-3 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-black text-text-dark placeholder:text-accent/30 transition-all"
                                    placeholder="Enter Location"
                                    defaultValue="Maharashtra"
                                />
                                <MapPin className="w-5 h-5 text-accent absolute left-4 top-1/2 -translate-y-1/2" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 p-1 bg-neutral-light/30 rounded-2xl border border-neutral-light/50">
                    {['7d', '1m', '6 m'].map(period => (
                        <button
                            key={period}
                            onClick={() => setTimeFilter(period)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeFilter === period ? 'bg-white text-primary shadow-sm border border-neutral-light text-primary' : 'text-accent hover:text-text-dark'}`}
                        >
                            {period}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <PriceCard
                    label="Today's Avg Price"
                    value={`₹${priceData.currentPrice.avg}`}
                    unit={`/ ${priceData.id === 'rice' ? 'quintal' : 'kg'}`}
                    icon={TrendingUp}
                    color="text-primary"
                    bg="bg-green-50"
                />
                <PriceCard
                    label="Lowest Price"
                    value={`₹${priceData.currentPrice.low}`}
                    unit={`/ ${priceData.id === 'rice' ? 'quintal' : 'kg'}`}
                    icon={ArrowDown}
                    color="text-red-500"
                    bg="bg-red-50"
                />
                <PriceCard
                    label="Highest Price"
                    value={`₹${priceData.currentPrice.high}`}
                    unit={`/ ${priceData.id === 'rice' ? 'quintal' : 'kg'}`}
                    icon={ArrowUp}
                    color="text-emerald-600"
                    bg="bg-emerald-50"
                />
                <PriceCard
                    label="Best Market"
                    value={priceData.currentPrice.bestMarket}
                    icon={MapPin}
                    color="text-blue-600"
                    bg="bg-blue-50"
                    isText
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Historical Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">Price Trend</h3>
                            <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1">Market fluctuations over time</p>
                        </div>
                        <div className="p-3 bg-neutral-light/30 rounded-2xl">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                    <div className="flex-1 min-h-[300px] flex items-center justify-center">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                    <div className="mt-6 p-4 bg-green-50/50 rounded-2xl border border-green-100/50 flex items-start gap-4">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[11px] text-green-800 font-bold leading-relaxed uppercase tracking-wider">
                            Prices are currently <span className="text-primary font-black">STABLE</span>. Historical data shows a 5% increase in market demand for {priceData.name} in your region.
                        </p>
                    </div>
                </div>

                {/* Mandi Comparison */}
                <div className="bg-white p-8 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col h-full">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-text-dark uppercase tracking-tight">Nearby Mandis</h3>
                        <p className="text-xs text-accent font-bold uppercase tracking-widest mt-1">Find the best local price</p>
                    </div>

                    <div className="space-y-4 flex-1">
                        {priceData.mandis.map((mandi, idx) => (
                            <div
                                key={idx}
                                className={`p-5 rounded-2xl border-2 transition-all flex items-center justify-between group ${mandi.isBest ? 'border-primary bg-primary/5 shadow-inner' : 'border-neutral-light hover:border-primary/20 bg-white'}`}
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-black text-text-dark">{mandi.name}</h4>
                                        {mandi.isBest && (
                                            <span className="px-2 py-0.5 bg-primary text-[10px] font-black text-white rounded-full uppercase tracking-widest">Best</span>
                                        )}
                                    </div>
                                    <div className="flex items-center text-[10px] text-accent font-bold uppercase tracking-widest">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {mandi.distance} from you
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-lg font-black text-primary">₹{mandi.price}</div>
                                    <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Per {priceData.id === 'rice' ? 'Quintal' : 'kg'}</p>
                                </div>
                            </div>
                        ))}
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
                                Green lines mean prices are going UP. This is a good time to sell!
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
    <div className="bg-white p-6 rounded-[2rem] border border-neutral-light shadow-sm flex flex-col space-y-4 transition-all hover:shadow-md hover:translate-y-[-2px] group">
        <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-1">{label}</p>
            <div className="flex items-baseline gap-1">
                <span className={`font-black tracking-tight ${isText ? 'text-xl text-text-dark' : 'text-3xl ' + color}`}>
                    {value}
                </span>
                {unit && <span className="text-xs text-accent font-bold uppercase">{unit}</span>}
            </div>
        </div>
    </div>
);

export default PriceInsights;
