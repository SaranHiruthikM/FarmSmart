import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cropService from "../services/crop.service";
import CropCard from "../components/marketplace/CropCard";
import InputField from "../components/common/InputField";
import poolingService from "../services/pooling.service";
import { Loader2, Search, Filter, Plus, Globe, Layers, Users2, ChevronRight } from "lucide-react";

const Marketplace = () => {
    const { t } = useTranslation();
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const location = useLocation();
    const [filters, setFilters] = useState({
        name: "",
        state: "",
        district: "",
    });
    const [viewType, setViewType] = useState("regular"); // "regular" or "institutional"
    const [batches, setBatches] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const nameParam = params.get('name');
        if (nameParam) {
            setFilters(prev => ({ ...prev, name: nameParam }));
            fetchCrops({ name: nameParam });
        } else {
            fetchCrops();
        }
    }, [location.search]);

    const fetchCrops = async (appliedFilters = {}) => {
        setLoading(true);
        try {
            if (viewType === "regular") {
                const query = { ...filters, ...appliedFilters };
                Object.keys(query).forEach(key => !query[key] && delete query[key]);
                const data = await cropService.getAllCrops(query);
                setCrops(data);
            } else {
                const data = await poolingService.getInstitutionalBatches(filters.name, filters.district);
                setBatches(data);
            }
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
                setCrops(crops.filter(crop => crop._id !== id));
            } catch (error) {
                console.error("Failed to delete crop", error);
                alert(t('marketplace.deleteFailed'));
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight">{t('nav.marketplace')}</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">{t('marketplace.subtitle')}</p>
                </div>
                <div className="flex bg-neutral-light/30 p-1.5 rounded-2xl gap-1">
                    <button
                        onClick={() => setViewType("regular")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewType === "regular" ? 'bg-white text-primary shadow-sm' : 'text-accent hover:bg-white/50'}`}
                    >
                        {t('marketplace.individual')}
                    </button>
                    <button
                        onClick={() => setViewType("institutional")}
                        className={`px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${viewType === "institutional" ? 'bg-white text-primary shadow-sm' : 'text-accent hover:bg-white/50'}`}
                    >
                        {t('marketplace.institutional')}
                    </button>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3.5 border-2 font-black rounded-2xl transition-all text-sm tracking-wider ${showFilters ? 'bg-neutral-light border-neutral-light text-text-dark' : 'bg-white border-neutral-light text-secondary hover:border-primary/50 hover:text-primary'}`}
                    >
                        <Filter className="w-5 h-5" />
                        {showFilters ? t('marketplace.hideFilters') : t('marketplace.showFilters')}
                    </button>
                    <Link
                        to="/dashboard/add-crop"
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-green-600 hover:-translate-y-1 transition-all text-sm tracking-wider"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" /> {t('marketplace.addCrop')}
                    </Link>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-light animate-in slide-in-from-top-2 duration-200">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <InputField
                            label={t('marketplace.searchCrop')}
                            name="name"
                            value={filters.name}
                            onChange={handleFilterChange}
                            placeholder="e.g. Rice"
                        />
                        <InputField
                            label={t('auth.state')}
                            name="state"
                            value={filters.state}
                            onChange={handleFilterChange}
                            placeholder={t('marketplace.filterByState')}
                        />
                        <InputField
                            label={t('auth.district')}
                            name="district"
                            value={filters.district}
                            onChange={handleFilterChange}
                            placeholder={t('marketplace.filterByDistrict')}
                        />
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition shadow-lg shadow-secondary/20"
                            >
                                <Search className="w-4 h-4" /> {t('common.search')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            ) : viewType === "regular" && crops.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-accent/30">
                    <Filter className="w-12 h-12 text-accent mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-bold text-text-dark">{t('marketplace.noCropsFound')}</h3>
                    <p className="text-accent">{t('marketplace.adjustFilters')}</p>
                </div>
            ) : viewType === "institutional" && batches.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-accent/30">
                    <Layers className="w-12 h-12 text-accent mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-bold text-text-dark">{t('marketplace.noBatches')}</h3>
                    <p className="text-accent">{t('marketplace.checkBackLater')}</p>
                </div>
            ) : viewType === "regular" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {crops.map((crop) => (
                        <CropCard
                            key={crop._id}
                            crop={crop}
                            onDelete={() => handleDelete(crop._id)}
                        />
                    ))}
                </div>
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
