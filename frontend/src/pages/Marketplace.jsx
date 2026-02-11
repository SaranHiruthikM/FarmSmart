import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import cropService from "../services/crop.service";
import CropCard from "../components/marketplace/CropCard";
import InputField from "../components/common/InputField";
import { Loader2, Search, Filter, Plus } from "lucide-react";

const Marketplace = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        name: "",
        state: "",
        district: "",
    });

    useEffect(() => {
        fetchCrops();
    }, []);

    const fetchCrops = async (appliedFilters = {}) => {
        setLoading(true);
        try {
            // Merge current state filters with any direct overrides if needed
            const query = { ...filters, ...appliedFilters };
            // Remove empty keys
            Object.keys(query).forEach(key => !query[key] && delete query[key]);

            const data = await cropService.getAllCrops(query);
            setCrops(data);
        } catch (error) {
            console.error("Failed to fetch crops", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCrops();
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await cropService.deleteCrop(id);
                setCrops(crops.filter(crop => crop._id !== id));
            } catch (error) {
                console.error("Failed to delete crop", error);
                alert("Failed to delete crop");
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-text-dark tracking-tight">Marketplace</h1>
                    <p className="text-secondary font-bold uppercase tracking-widest text-xs mt-1">Discover fresh crops directly from farmers.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3.5 border-2 font-black rounded-2xl transition-all text-sm tracking-wider ${showFilters ? 'bg-neutral-light border-neutral-light text-text-dark' : 'bg-white border-neutral-light text-secondary hover:border-primary/50 hover:text-primary'}`}
                    >
                        <Filter className="w-5 h-5" /> 
                        {showFilters ? "HIDE FILTERS" : "SHOW FILTERS"}
                    </button>
                    <Link
                        to="/dashboard/add-crop"
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-green-600 hover:-translate-y-1 transition-all text-sm tracking-wider"
                    >
                        <Plus className="w-5 h-5 stroke-[3px]" /> ADD NEW CROP
                    </Link>
                </div>
            </div>

            {/* Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-light animate-in slide-in-from-top-2 duration-200">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <InputField
                            label="Search Crop"
                            name="name"
                            value={filters.name}
                            onChange={handleFilterChange}
                            placeholder="e.g. Rice"
                        />
                        <InputField
                            label="State"
                            name="state"
                            value={filters.state}
                            onChange={handleFilterChange}
                            placeholder="Filter by State"
                        />
                        <InputField
                            label="District"
                            name="district"
                            value={filters.district}
                            onChange={handleFilterChange}
                            placeholder="Filter by District"
                        />
                        <div className="mb-4">
                            <button
                                type="submit"
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white font-bold rounded-xl hover:bg-secondary-dark transition shadow-lg shadow-secondary/20"
                            >
                                <Search className="w-4 h-4" /> Search
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
            ) : crops.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-accent/30">
                    <Filter className="w-12 h-12 text-accent mx-auto mb-3 opacity-50" />
                    <h3 className="text-lg font-bold text-text-dark">No crops found</h3>
                    <p className="text-accent">Try adjusting your filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {crops.map((crop) => (
                        <CropCard
                            key={crop._id}
                            crop={crop}
                            onDelete={() => handleDelete(crop._id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
