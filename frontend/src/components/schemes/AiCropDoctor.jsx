import React, { useState } from "react";
import aiAdvisoryService from "../../services/aiAdvisory.service";
import { Stethoscope, Send, AlertCircle, CheckCircle, Info, Activity, RefreshCw } from "lucide-react";

const AiCropDoctor = () => {
    const [symptoms, setSymptoms] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleDiagnose = async (e) => {
        e.preventDefault();
        if (!symptoms.trim() || symptoms.length < 10) {
            setError("Please describe the symptoms in more detail (at least 10 characters).");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const data = await aiAdvisoryService.diagnose(symptoms);
            setResult(data);
        } catch (err) {
            setError("The AI Doctor is busy right now. Please try again in 30 seconds.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setResult(null);
        setSymptoms("");
        setError(null);
    };

    return (
        <div className="bg-white rounded-3xl border border-neutral-light shadow-sm overflow-hidden flex flex-col h-full relative group">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
                <Stethoscope className="w-32 h-32 text-primary" />
            </div>

            <div className="p-6 border-b border-neutral-light flex items-center justify-between relative z-10 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary">
                        <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-text-dark tracking-tight uppercase">AI Crop Doctor</h3>
                        <p className="text-[10px] text-accent font-bold uppercase tracking-widest">Instant Expert Diagnosis</p>
                    </div>
                </div>
                {result && (
                    <button
                        onClick={reset}
                        className="p-2 hover:bg-neutral-light rounded-xl transition-colors text-accent"
                        title="New Consultation"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col relative z-10">
                {!result ? (
                    <form onSubmit={handleDiagnose} className="space-y-4 flex-1 flex flex-col">
                        <div className="space-y-1.5 flex-1 flex flex-col">
                            <label className="text-[10px] font-black text-accent uppercase tracking-widest ml-1">
                                Describe Symptoms
                            </label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="E.g. My tomato leaves have small yellow spots with black centers... "
                                className="w-full flex-1 p-4 bg-neutral-light/30 border-2 border-transparent focus:border-primary focus:bg-white rounded-2xl outline-none font-bold text-sm text-text-dark transition-all resize-none min-h-[120px]"
                                disabled={loading}
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-100">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !symptoms.trim()}
                            className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-lg ${loading || !symptoms.trim()
                                ? "bg-neutral-light text-accent shadow-none cursor-not-allowed"
                                : "bg-primary text-white hover:bg-green-600 shadow-primary/20"
                                }`}
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                    Analyzing Symptoms...
                                </>
                            ) : (
                                <>
                                    Diagnose Now
                                    <Send className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <div className="flex gap-3">
                                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-blue-700 font-bold leading-relaxed italic">
                                    Our AI uses Indian agricultural standards to identify diseases, pests, and nutrient deficiencies.
                                </p>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Diagnosis Header */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-accent uppercase tracking-widest">Diagnosis Results</span>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 uppercase transition-colors ${result.urgency === 'Critical' || result.urgency === 'High' ? 'bg-red-50 text-red-600 border border-red-100' :
                                    result.urgency === 'Medium' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' : 'bg-green-50 text-green-600 border border-green-100'
                                    }`}>
                                    <Activity className="w-3 h-3" />
                                    {result.urgency} Urgency
                                </div>
                            </div>
                            <h4 className="text-2xl font-black text-text-dark">{result.diagnosis}</h4>
                            <div className="flex items-center gap-2">
                                <div className="w-full h-1.5 bg-neutral-light rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: result.certainty }}
                                    />
                                </div>
                                <span className="text-[10px] font-black text-primary whitespace-nowrap">{result.certainty} Certainty</span>
                            </div>
                        </div>

                        {/* Causes */}
                        <div className="space-y-2">
                            <h5 className="text-[10px] font-black text-accent uppercase tracking-widest">Possible Causes</h5>
                            <div className="flex flex-wrap gap-2">
                                {result.possibleCauses.map((cause, idx) => (
                                    <span key={idx} className="px-3 py-1.5 bg-neutral-light/50 border border-neutral-light text-[10px] font-bold text-text-dark rounded-xl">
                                        {cause}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Treatment Tabs-like structure */}
                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-accent uppercase tracking-widest">Recommended Treatment Plan</h5>

                            <div className="space-y-3">
                                {result.treatmentPlan?.immediateActions?.length > 0 && (
                                    <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-black text-text-dark uppercase tracking-tight">Immediate Actions</span>
                                        </div>
                                        <ul className="space-y-1.5">
                                            {result.treatmentPlan.immediateActions.map((action, idx) => (
                                                <li key={idx} className="text-[11px] font-bold text-accent pl-2 border-l-2 border-primary/20">{action}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="p-4 bg-green-50/50 rounded-2xl border border-green-100">
                                        <span className="text-[10px] font-black text-green-700 uppercase tracking-widest block mb-2">Organic Options</span>
                                        <ul className="space-y-1">
                                            {result.treatmentPlan?.organicOptions?.map((opt, idx) => (
                                                <li key={idx} className="text-[10px] font-bold text-green-800">• {opt}</li>
                                            ))}
                                            {(!result.treatmentPlan?.organicOptions || result.treatmentPlan.organicOptions.length === 0) && <li className="text-[10px] font-bold text-accent">No specific organic advice.</li>}
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest block mb-2">Chemical (India)</span>
                                        <ul className="space-y-1">
                                            {result.treatmentPlan?.chemicalOptions?.map((opt, idx) => (
                                                <li key={idx} className="text-[10px] font-bold text-blue-800">• {opt}</li>
                                            ))}
                                            {(!result.treatmentPlan?.chemicalOptions || result.treatmentPlan.chemicalOptions.length === 0) && <li className="text-[10px] font-bold text-accent">No specific chemical advice.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={reset}
                            className="w-full py-3 bg-neutral-light hover:bg-neutral-light/80 text-text-dark text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                        >
                            Start New Consultation
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AiCropDoctor;
