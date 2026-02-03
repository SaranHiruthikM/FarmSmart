import { MapPin, Tag, Scale, BadgeIndianRupee } from "lucide-react";
import { Link } from "react-router-dom";

const CropCard = ({ crop }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-neutral-light">
            <div className="h-48 bg-secondary-light/20 relative flex items-center justify-center overflow-hidden">
                {/* Placeholder for crop image - could be replaced with real image later */}
                <div className="text-secondary opacity-50 flex flex-col items-center">
                    <span className="text-4xl">🌾</span>
                    <span className="text-sm mt-2 font-medium">No Image</span>
                </div>
                <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${crop.qualityGrade === 'A' ? 'bg-green-100 text-green-700' :
                            crop.qualityGrade === 'B' ? 'bg-yellow-100 text-yellow-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                        Grade {crop.qualityGrade}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-lg font-bold text-text-dark line-clamp-1">{crop.name}</h3>
                        <p className="text-sm text-accent font-medium">{crop.variety}</p>
                    </div>
                    <div className="flex items-center text-primary font-bold">
                        <BadgeIndianRupee className="w-4 h-4 mr-0.5" />
                        <span className="text-lg">{crop.basePrice}</span>
                        <span className="text-xs text-accent font-normal ml-1">/{crop.unit}</span>
                    </div>
                </div>

                <div className="space-y-2 mt-4">
                    <div className="flex items-center text-sm text-accent-dark">
                        <Scale className="w-4 h-4 mr-2 text-accent" />
                        <span className="font-medium text-text-dark">{crop.quantity} {crop.unit}</span>
                        <span className="text-xs ml-1 bg-secondary-light/30 text-secondary px-1.5 py-0.5 rounded">Available</span>
                    </div>

                    <div className="flex items-center text-sm text-accent-dark">
                        <MapPin className="w-4 h-4 mr-2 text-accent" />
                        <span className="truncate">
                            {crop.location.village}, {crop.location.district}, {crop.location.state}
                        </span>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-light flex justify-between items-center">
                    {/* This could link to details page */}
                    <Link to={`/marketplace/${crop._id}`} className="text-primary text-sm font-bold hover:underline">
                        View Details
                    </Link>
                    <span className="text-xs text-accent">Posted {new Date(crop.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );
};

export default CropCard;
