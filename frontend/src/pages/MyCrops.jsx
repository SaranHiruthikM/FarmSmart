import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import cropService from "../services/crop.service";
import { Loader2, Plus, Edit, Trash2, TrendingUp } from "lucide-react";

const MyCrops = () => {
    const [crops, setCrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMyCrops();
    }, []);

    const fetchMyCrops = async () => {
        try {
            const data = await cropService.getMyCrops();
            setCrops(data);
        } catch (error) {
            console.error("Failed to fetch my crops", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            try {
                await cropService.deleteCrop(id);
                // Remove from state directly
                setCrops(crops.filter(crop => crop._id !== id));
            } catch (error) {
                console.error("Failed to delete crop", error);
                alert("Failed to delete crop");
            }
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text-dark">My Crops</h1>
                    <p className="text-accent mt-1">Manage your active listings and inventory.</p>
                </div>
                <Link
                    to="/dashboard/my-crops/new"
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-green-600 transition"
                >
                    <Plus className="w-5 h-5" /> Add New Crop
                </Link>
            </div>

            {/* Stats Summary (Optional) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-neutral-light shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 rounded-lg text-primary">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-sm font-bold text-accent">Total Listings</h3>
                    </div>
                    <p className="text-3xl font-bold text-text-dark">{crops.length}</p>
                </div>
                {/* Add more stats if needed */}
            </div>

            {/* Listings Table */}
            <div className="bg-white rounded-2xl border border-neutral-light shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8f9fa] border-b border-neutral-light">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Crop Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Price / Unit</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-accent uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-light">
                            {crops.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-accent">
                                        You haven't listed any crops yet.
                                    </td>
                                </tr>
                            ) : (
                                crops.map((crop) => (
                                    <tr key={crop._id} className="hover:bg-[#f8f9fa] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-text-dark">{crop.name}</div>
                                            <div className="text-xs text-accent">{crop.variety}</div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-text-dark">
                                            ₹{crop.basePrice} <span className="text-xs text-accent font-normal">/{crop.unit}</span>
                                        </td>
                                        <td className="px-6 py-4 text-text-dark font-medium">
                                            {crop.quantity} {crop.unit}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${crop.qualityGrade === 'A' ? 'bg-green-100 text-green-700' :
                                                    crop.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {crop.qualityGrade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${crop.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                                {crop.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => navigate(`/dashboard/my-crops/edit/${crop._id}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                title="Edit"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(crop._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MyCrops;
