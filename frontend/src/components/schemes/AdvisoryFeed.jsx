import  { useEffect, useState } from "react";
import schemesService from "../../services/schemes.service";
import { CloudSun, Sprout, Calendar } from "lucide-react";

const AdvisoryFeed = () => {
    const [advisory, setAdvisory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        schemesService.getAdvisory().then((data) => {
            setAdvisory(data);
            setLoading(false);
        });
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case "weather": return <CloudSun className="w-5 h-5 text-blue-500" />;
            case "seasonal": return <Calendar className="w-5 h-5 text-orange-500" />;
            default: return <Sprout className="w-5 h-5 text-green-500" />;
        }
    };

    if (loading) return <div className="p-4 text-center text-xs text-gray-400">Loading advisory...</div>;

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Advisory Feed</h3>
            <div className="space-y-4">
                {advisory.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="bg-gray-100 p-2 rounded-full shrink-0">
                            {getIcon(item.type)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.content}</p>
                            <span className="text-[10px] text-gray-400 mt-2 block">{item.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdvisoryFeed;
