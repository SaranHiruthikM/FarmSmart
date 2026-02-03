import { useState, useEffect } from "react";
import cropService from "../services/crop.service";
import CropCard from "../components/marketplace/CropCard";
import InputField from "../components/common/InputField";
import { Loader2, Search, Filter } from "lucide-react";

const Marketplace = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">Marketplace</h1>
                    <p className="text-accent mt-1">Discover fresh crops directly from farmers.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-light">
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
                            className="w-full py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                            <Search className="w-4 h-4" /> Search
                        </button>
                    </div>
                </form>
            </div>

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
                        <CropCard key={crop._id} crop={crop} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
