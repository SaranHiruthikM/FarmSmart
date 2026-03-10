import  { useState, useEffect } from "react";
import api from "../../services/api";
import { CheckCircle2, Save, Percent } from "lucide-react";

const QualityStandards = () => {
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Tracking edits
    const [edits, setEdits] = useState({});

    useEffect(() => {
        fetchRules();
    }, []);

    const fetchRules = async () => {
        try {
            const res = await api.get("/quality");
            setRules(res.data);
            
            // Initialize edit state
            const initialEdits = {};
            res.data.forEach(r => {
                initialEdits[r._id] = { 
                    multiplier: r.multiplier, 
                    description: r.description,
                    minSize: r.minSize || 0,
                    maxMoisture: r.maxMoisture || 100
                };
            });
            setEdits(initialEdits);
        } catch (error) {
            console.error("Failed to fetch quality rules", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (id) => {
        try {
            await api.put(`/quality/${id}`, edits[id]);
            alert("Pricing rules updated successfully");
            fetchRules(); // refresh
        } catch (error) {
            console.log(error)
            alert("Failed to update rule.");
        }
    };

    if (loading) return <div className="text-center text-slate-400 py-10">Loading Matrix...</div>;

    return (
        <div className="space-y-6">
             <div className="mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
                    <CheckCircle2 className="text-green-400" />
                    Quality Standards Matrix
                </h1>
                <p className="text-slate-400">Update global multiplier algorithms for produce grading.</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="space-y-4">
                     {rules.map((rule) => (
                         <div key={rule._id} className="bg-slate-800 border border-slate-700 p-6 rounded-2xl relative overflow-hidden">
                             {/* Side Grade indicator */}
                             <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                 rule.grade === 'A' ? 'bg-green-500' :
                                 rule.grade === 'B' ? 'bg-yellow-500' : 'bg-red-500'
                             }`}></div>
                             
                             <div className="flex justify-between items-center mb-4 pl-4">
                                 <h3 className="text-xl font-black text-white">Grade {rule.grade} Details</h3>
                                 <button 
                                     onClick={() => handleSave(rule._id)}
                                     className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
                                     <Save className="w-4 h-4" /> Save
                                 </button>
                             </div>
                             
                             <div className="space-y-4 pl-4">
                                  <div>
                                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <Percent className="w-3 h-3"/> Base Price Multiplier
                                     </label>
                                     <div className="flex items-center">
                                         <input 
                                             type="number" 
                                             step="0.01" 
                                             value={edits[rule._id]?.multiplier || ""}
                                             onChange={(e) => setEdits({...edits, [rule._id]: {...edits[rule._id], multiplier: Number(e.target.value)}})}
                                             className="bg-slate-900 border border-slate-700 text-2xl font-bold text-white rounded-xl px-4 py-2 w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                         />
                                         <span className="ml-3 text-slate-500 font-medium">x Base Price</span>
                                     </div>
                                 </div>
                                 
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Min Size (mm)</label>
                                         <input 
                                             type="number" 
                                             value={edits[rule._id]?.minSize || ""}
                                             onChange={(e) => setEdits({...edits, [rule._id]: {...edits[rule._id], minSize: Number(e.target.value)}})}
                                             className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Max Moisture (%)</label>
                                         <input 
                                             type="number" 
                                             value={edits[rule._id]?.maxMoisture || ""}
                                             onChange={(e) => setEdits({...edits, [rule._id]: {...edits[rule._id], maxMoisture: Number(e.target.value)}})}
                                             className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                         />
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Technical Description</label>
                                     <textarea
                                         rows="3"
                                         value={edits[rule._id]?.description || ""}
                                         onChange={(e) => setEdits({...edits, [rule._id]: {...edits[rule._id], description: e.target.value}})}
                                         className="w-full bg-slate-900 border border-slate-700 text-sm text-slate-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                     ></textarea>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
                 
                 <div className="bg-slate-800/50 border border-blue-500/20 p-8 rounded-2xl h-fit">
                    <h3 className="text-lg font-bold text-blue-400 mb-4 flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> Live Pricing Calculator Preview</h3>
                    <p className="text-sm text-slate-400 mb-6">Test the impact of multiplier changes before saving.</p>
                    
                    <div className="space-y-4 font-mono">
                        <div className="flex justify-between items-center text-sm border-b border-slate-700 pb-2">
                             <span className="text-slate-500">Base Price (example)</span>
                             <span className="text-white">₹1000 / Quintal</span>
                        </div>
                        {rules.map(rule => {
                             const mult = edits[rule._id]?.multiplier || 1;
                             return (
                                 <div key={`calc-${rule._id}`} className="flex justify-between items-center text-sm py-2">
                                     <span className="text-slate-300">Grade {rule.grade} (<span className="text-blue-400">{mult}x</span>)</span>
                                     <span className="text-emerald-400 font-bold">₹{Math.round(1000 * mult)}</span>
                                 </div>
                             )
                        })}
                    </div>
                 </div>
             </div>
        </div>
    );
};

export default QualityStandards;
