import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Landmark, Plus, Edit, Trash2 } from "lucide-react";

const SchemesManager = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ name: "", description: "", benefits: "", applyLink: "", eligibilityCriteria: "", applicableStates: "" });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSchemes();
    }, []);

    const fetchSchemes = async () => {
        try {
            const res = await api.get("/schemes");
            setSchemes(res.data);
        } catch (error) {
            console.error("Failed to fetch schemes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (scheme = null) => {
        if (scheme) {
            setFormData({
                name: scheme.name,
                description: scheme.description,
                benefits: scheme.benefits.join(", "),
                applyLink: scheme.applyLink || "",
                eligibilityCriteria: scheme.eligibilityCriteria || "",
                applicableStates: scheme.applicableStates ? scheme.applicableStates.join(", ") : ""
            });
            setEditingId(scheme._id);
        } else {
            setFormData({ name: "", description: "", benefits: "", applyLink: "", eligibilityCriteria: "", applicableStates: "" });
            setEditingId(null);
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            benefits: formData.benefits.split(",").map(b => b.trim()).filter(b => b),
            applicableStates: formData.applicableStates.split(",").map(s => s.trim()).filter(s => s)
        };

        try {
            if (editingId) {
                await api.put(`/schemes/${editingId}`, payload);
            } else {
                await api.post("/schemes", payload);
            }
            fetchSchemes();
            setShowModal(false);
        } catch (error) {
            alert("Failed to save scheme.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await api.delete(`/schemes/${id}`);
            fetchSchemes();
        } catch (error) {
            alert("Failed to delete scheme.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Landmark className="text-blue-400" />
                    Government Schemes Manager
                </h1>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-colors font-medium">
                    <Plus className="w-4 h-4" /> Add Scheme
                </button>
            </div>

            {loading ? (
                <div className="text-center text-slate-400 py-10">Loading Schemes...</div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {schemes.map((scheme) => (
                        <div key={scheme._id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative">
                            <div className="absolute top-6 right-6 flex gap-2">
                                <button onClick={() => handleOpenModal(scheme)} className="p-2 bg-slate-700/50 hover:bg-slate-700 text-blue-400 rounded-lg transition-colors">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(scheme._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-2 pr-20">{scheme.name}</h3>
                            <p className="text-sm text-slate-400 mb-4">{scheme.description}</p>
                            
                            <div className="space-y-3 mt-4 pt-4 border-t border-slate-700/50">
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Benefits</span>
                                    <div className="flex flex-wrap gap-2">
                                        {scheme.benefits?.map((b, i) => (
                                            <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs border border-green-500/20">{b}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Applicable States</span>
                                    <div className="flex flex-wrap gap-2">
                                        {scheme.applicableStates?.length > 0 ? scheme.applicableStates.map((s, i) => (
                                            <span key={i} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">{s}</span>
                                        )) : <span className="text-xs text-slate-400 italic">All States</span>}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Eligibility</span>
                                    <p className="text-sm text-slate-300">{scheme.eligibilityCriteria || "Not specified"}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-xl shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4">{editingId ? "Edit Scheme" : "Add New Scheme"}</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Scheme Name</label>
                                <input required type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <textarea required rows="2" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Benefits (comma-separated)</label>
                                <input required type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.benefits} onChange={e => setFormData({...formData, benefits: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Application Link</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.applyLink} onChange={e => setFormData({...formData, applyLink: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Eligibility Criteria</label>
                                <textarea rows="2" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.eligibilityCriteria} onChange={e => setFormData({...formData, eligibilityCriteria: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Applicable States (comma-separated, leave empty for all)</label>
                                <input type="text" className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                                    value={formData.applicableStates} onChange={e => setFormData({...formData, applicableStates: e.target.value})} />
                            </div>
                            <div className="flex gap-3 justify-end pt-4 border-t border-slate-700">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">Save Scheme</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SchemesManager;
