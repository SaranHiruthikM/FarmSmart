import  { useState, useEffect } from "react";
import api from "../../services/api";
import { AlertTriangle, Plus, CloudRain, ShieldCheck, CalendarClock } from "lucide-react";

const AdvisoryManager = () => {
    const [advisories, setAdvisories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ title: "", content: "", type: "tip", crop: "", state: "", scheduledDate: "", isScheduled: false });

    useEffect(() => {
        fetchAdvisories();
    }, []);

    const fetchAdvisories = async () => {
        try {
            const res = await api.get("/advisory/admin/all");
            setAdvisories(res.data);
        } catch (error) {
            console.error("Failed to fetch advisories", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({ title: "", content: "", type: "tip", crop: "", state: "", scheduledDate: "", isScheduled: false });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/advisory", formData);
            fetchAdvisories();
            setShowModal(false);
        } catch (error) {
            console.log(error)
            alert("Failed to broadcast advisory.");
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case "weather": return <CloudRain className="w-5 h-5 text-blue-400" />;
            case "seasonal": return <CalendarClock className="w-5 h-5 text-green-400" />;
            default: return <ShieldCheck className="w-5 h-5 text-yellow-400" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="text-yellow-400" />
                    Advisory & Alerts
                </h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-500/20 px-4 py-2 rounded-xl transition-colors font-medium">
                    <Plus className="w-4 h-4" /> Broadcast Advisory
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-400 py-10">Loading Advisories...</div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Title & Description</th>
                                <th className="px-6 py-4 w-32">Type</th>
                                <th className="px-6 py-4 w-32">Target</th>
                                <th className="px-6 py-4 w-40 text-right">Date/Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {advisories.map((adv) => (
                                <tr key={adv._id} className="hover:bg-slate-700/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white mb-1">{adv.title}</div>
                                        <div className="text-slate-400 line-clamp-2">{adv.content}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(adv.type)}
                                            <span className="capitalize">{adv.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {adv.crop && <span className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs block w-max">Crop: {adv.crop}</span>}
                                            {adv.state && <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20 block w-max">State: {adv.state}</span>}
                                            {(!adv.crop && !adv.state) && <span className="text-slate-500 italic text-xs">Global</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        <div>{new Date(adv.createdAt).toLocaleDateString()}</div>
                                        {adv.isScheduled && (
                                           <div className="text-yellow-400 font-medium mt-1">
                                               Sch: {new Date(adv.scheduledDate).toLocaleDateString()}
                                           </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">Broadcast New Advisory</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Advisory Type</label>
                                <select className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-yellow-500" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                                    <option value="tip">Agricultural Tip</option>
                                    <option value="weather">Weather Warning</option>
                                    <option value="seasonal">Seasonal Alert</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                                <input required type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none" 
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Content/Message</label>
                                <textarea required rows="4" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none" 
                                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Target Crop (optional)</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none" 
                                    value={formData.crop} onChange={e => setFormData({...formData, crop: e.target.value})} placeholder="e.g. Wheat, Tomato" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Target State (optional)</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none" 
                                    value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="e.g. Maharashtra, Punjab" />
                            </div>
                            
                            <div className="bg-slate-900/50 p-4 border border-slate-700 rounded-xl space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-slate-800"
                                        checked={formData.isScheduled} onChange={e => setFormData({...formData, isScheduled: e.target.checked})} />
                                    <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><CalendarClock className="w-4 h-4 text-blue-400"/> Schedule for future date?</span>
                                </label>
                                
                                {formData.isScheduled && (
                                    <div>
                                        <input type="date" required className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 outline-none" 
                                            value={formData.scheduledDate} onChange={e => setFormData({...formData, scheduledDate: e.target.value})} />
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium">Broadcast</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvisoryManager;
