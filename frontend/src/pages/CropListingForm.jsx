import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import cropService from "../services/crop.service";
import CropForm from "../components/marketplace/CropForm";
import { ArrowLeft } from "lucide-react";

const CropListingForm = () => {
    const { id } = useParams(); // If ID exists, we are editing
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
            alert("Failed to load crop details");
            navigate("/dashboard/marketplace");
        } finally {
            setFetching(false);
        }
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        try {
            if (id) {
                await cropService.updateCrop(id, formData);
                alert("Crop updated successfully!");
            } else {
                await cropService.createCrop(formData);
                alert("Crop listed successfully!");
            }
            navigate("/dashboard/marketplace");
        } catch (error) {
            console.error("Failed to save crop", error);
            alert("Failed to save crop. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-10 text-center">Loading...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-accent hover:text-primary transition font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </button>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-neutral-light">
                <h1 className="text-2xl font-bold text-text-dark mb-6">
                    {id ? "Edit Crop Listing" : "List New Crop"}
                </h1>

                <CropForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    buttonLabel={id ? "Update Listing" : "Publish Listing"}
                />
            </div>
        </div>
    );
};

export default CropListingForm;
