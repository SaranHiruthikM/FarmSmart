import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import cropService from "../services/crop.service";
import CropForm from "../components/marketplace/CropForm";
import { ArrowLeft, Loader2, Sprout } from "lucide-react";

const CropListingForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [fetching, setFetching] = useState(!!id);

    useEffect(() => {
        if (id) {
            loadCrop(id);
        }
    }, [id]);

    const loadCrop = async (cropId) => {
        try {
            const data = await cropService.getCropById(cropId);
            setInitialData(data);
        } catch (error) {
            console.error("Failed to load crop", error);
            navigate("/dashboard/marketplace");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (data) => {
        setLoading(true);
        try {
            const formData = new FormData();
            
            // Append fields
            Object.keys(data).forEach(key => {
                // Skip internal keys or populated objects that shouldn't be updated
                if (['farmer', 'farmerId', 'farmerName', 'farmerPhone', 'farmerRating', 'reviewCount', '_id', '__v', 'createdAt', 'updatedAt'].includes(key)) {
                    return;
                }

                if (key === 'location') {
                    if (data.location?.state) formData.append('location.state', data.location.state);
                    if (data.location?.district) formData.append('location.district', data.location.district);
                    if (data.location?.village) formData.append('location.village', data.location.village);
                } else if (key === 'imageFile') {
                    if (data.imageFile) {
                        formData.append('image', data.imageFile);
                    }
                } else if (data[key] !== undefined && data[key] !== null) {
                     formData.append(key, data[key]);
                }
            });

            if (id) {
                await cropService.updateCrop(id, formData);
            } else {
                await cropService.createCrop(formData);
            }
            navigate("/dashboard/marketplace");
        } catch (error) {
            console.error("Failed to save crop", error);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-nature-600 animate-spin mb-4" />
                <p className="text-nature-600 font-medium">Loading details...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-10">
            <button
                onClick={() => navigate(-1)}
                className="group flex items-center text-nature-600 hover:text-nature-800 transition-colors font-bold mb-6"
            >
                <div className="bg-white/50 p-2 rounded-full mr-2 group-hover:bg-nature-100 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </div>
                Back to Marketplace
            </button>

            <div className="glass-panel p-6 md:p-10 rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                    <Sprout className="w-64 h-64 text-nature-600" />
                </div>

                <div className="relative z-10">
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl md:text-3xl font-black text-nature-900 tracking-tight mb-2">
                            {id ? "Edit Crop Listing" : "List New Crop"}
                        </h1>
                        <p className="text-nature-600 text-base md:text-lg">
                            {id ? "Update your crop details below." : "Share your harvest with buyers directly."}
                        </p>
                    </div>

                    <CropForm
                        initialData={initialData}
                        onSubmit={handleSubmit}
                        isLoading={loading}
                        buttonLabel={id ? "Update Listing" : "Publish Listing"}
                    />
                </div>
            </div>
        </div>
    );
};

export default CropListingForm;
