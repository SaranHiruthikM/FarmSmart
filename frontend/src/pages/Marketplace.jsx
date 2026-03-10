import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cropService from "../services/crop.service";
import CropCard from "../components/marketplace/CropCard";
import InputField from "../components/common/InputField";
import poolingService from "../services/pooling.service";
import { Loader2, Search, Filter, Plus, Globe, Layers, Users2, ChevronRight, Leaf } from "lucide-react";

const Marketplace = () => {
    const { t } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        state: "",
        district: "",
    });
    const [viewType, setViewType] = useState("regular"); // "regular" or "institutional"
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async () => {
        setLoading(true);
        try {
            const query = { ...filters };
            // Remove empty keys
            Object.keys(query).forEach(key => !query[key] && delete query[key]);
            
            const data = await cropService.getAllCrops(query);
            setCrops(data);
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrops();
    }, [viewType]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCrops();
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('marketplace.confirmDelete'))) {
            try {
                await cropService.deleteCrop(id);
                // Optimistically remove from UI
                setCrops(currentCrops => currentCrops.filter(crop => crop.id !== id));
            } catch (error) {
                console.error("Failed to delete crop", error);
                alert(t('marketplace.deleteFailed'));
            }
        }
    };

    return (
        <div className="space-y-8 pb-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <h1 className="text-3xl md:text-4xl font-black text-nature-900 tracking-tight flex items-center gap-3">
                        <Leaf className="w-8 h-8 md:w-10 md:h-10 text-nature-600 fill-nature-100" />
                        Marketplace
                   </h1>
                   <p className="text-nature-600 font-medium text-base md:text-lg mt-2 max-w-2xl">
                        Discover fresh, locally sourced crops directly from verified farmers. 
                        Fair prices, transparent quality.
                   </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold transition-all duration-300 border ${
                            showFilters 
                            ? 'bg-nature-100 text-nature-800 border-nature-200 shadow-inner' 
                            : 'glass-card text-nature-700 hover:bg-white hover:text-nature-900 border-white/60'
                        }`}
                    >
                        <Filter className="w-5 h-5" />
                        {showFilters ? t('marketplace.hideFilters') : t('marketplace.showFilters')}
                    </button>
                    
                    <Link
                        to="/dashboard/add-crop"
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-nature-600 hover:bg-nature-700 text-white font-bold rounded-2xl shadow-lg shadow-nature-600/30 hover:-translate-y-1 transition-all duration-300"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" /> {t('marketplace.addCrop')}
                    </Link>
                </div>
            </div>

            {/* Glass Filter Panel */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showFilters ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="glass-panel p-6 rounded-3xl mb-2">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-nature-700 ml-1">Crop Name</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-3.5 w-5 h-5 text-nature-400" />
                                <input
                                    type="text"
                                    name="name"
                                    value={filters.name}
                                    onChange={handleFilterChange}
                                    placeholder="Search e.g. Rice"
                                    className="w-full pl-12 pr-4 py-3 bg-white/50 border border-nature-200 rounded-xl focus:ring-2 focus:ring-nature-400 focus:border-nature-400 outline-none transition-all placeholder:text-nature-300 text-nature-800 font-medium"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-nature-700 ml-1">State</label>
                            <input
                                type="text"
                                name="state"
                                value={filters.state}
                                onChange={handleFilterChange}
                                placeholder="Filter by State"
                                className="w-full px-4 py-3 bg-white/50 border border-nature-200 rounded-xl focus:ring-2 focus:ring-nature-400 focus:border-nature-400 outline-none transition-all placeholder:text-nature-300 text-nature-800 font-medium"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-nature-700 ml-1">District</label>
                            <input
                                type="text"
                                name="district"
                                value={filters.district}
                                onChange={handleFilterChange}
                                placeholder="Filter by District"
                                className="w-full px-4 py-3 bg-white/50 border border-nature-200 rounded-xl focus:ring-2 focus:ring-nature-400 focus:border-nature-400 outline-none transition-all placeholder:text-nature-300 text-nature-800 font-medium"
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                className="w-full py-3 bg-nature-800 text-white font-bold rounded-xl hover:bg-nature-900 transition-colors shadow-lg shadow-nature-800/20"
                            >
                                Apply Filters
                                <Search className="w-4 h-4" /> {t('common.search')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 min-h-[40vh]">
                    <Loader2 className="w-12 h-12 text-nature-600 animate-spin mb-4" />
                    <p className="text-nature-600 font-medium animate-pulse">Fetching fresh listings...</p>
                </div>
            ) : viewType === 'regular' ? (
                crops.length === 0 ? (
                    <div className="glass-panel text-center py-24 rounded-3xl border border-dashed border-nature-300/50">
                        <div className="bg-nature-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Leaf className="w-10 h-10 text-nature-400" />
                        </div>
                        <h3 className="text-2xl font-black text-nature-800 mb-2">No crops found</h3>
                        <p className="text-nature-500 max-w-md mx-auto">
                            We couldn't find any listings matching your specific criteria. Try adjusting your filters or search for something else.
                        </p>
                        <button 
                            onClick={() => {
                                setFilters({ name: "", state: "", district: "" });
                                fetchCrops();
                            }}
                            className="mt-6 text-nature-700 font-bold hover:text-nature-900 hover:underline underline-offset-4"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {crops.map((crop) => (
                            <CropCard
                                key={crop._id || crop.id}
                                crop={crop}
                                onDelete={() => handleDelete(crop._id || crop.id)}
                            />
                        ))}
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {batches.map((batch) => (
                        <div key={batch._id} className="bg-white p-6 rounded-2xl border border-neutral-light shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-[#1a1f1b] text-lg">{batch.cropName}</h4>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-accent uppercase tracking-widest">
                                        <Globe className="w-3 h-3" /> {batch.district}, {batch.state}
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${batch.status === 'LOCKED' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                    {batch.status}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-accent/60">
                                    <span>{t('marketplace.collected')}: {batch.currentQuantity} {batch.unit}</span>
                                    <span>{t('dashboard.target')}: {batch.targetQuantity} {batch.unit}</span>
                                </div>
                                <div className="h-1.5 w-full bg-neutral-light/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000"
                                        style={{ width: `${batch.progress}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-neutral-light flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-8 h-8 rounded-full bg-neutral-light/50 flex items-center justify-center">
                                        <Users2 className="w-4 h-4 text-accent" />
                                    </div>
                                    <span className="text-xs font-bold text-text-dark">{batch.members?.length || 0} {t('marketplace.farmers')}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-accent uppercase">{t('marketplace.basePrice')}</p>
                                    <p className="font-bold text-primary italic">₹{batch.basePrice}/kg</p>
                                </div>
                            </div>

                            <button className="w-full py-3 bg-secondary text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-secondary-dark transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2">
                                {t('marketplace.sourceBatch')} <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
