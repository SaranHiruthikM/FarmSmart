import React, { useState, useEffect } from "react";
import api from "../../services/api";
import authService from "../../services/auth.service";
import { HandCoins, ChevronRight, X, Sparkles, AlertCircle } from "lucide-react";

/**
 * Contextual scheme alert that matches schemes based on the crop currently being entered by the user
 */
const ContextualSchemeAlert = ({ currentCrop, currentState }) => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const user = authService.getCurrentUser();

    // Prioritize the state typed in the form, fallback to user profile
    const state = currentState || user?.state || "India";

    useEffect(() => {
        if (currentCrop && currentCrop.trim().length >= 3) {
            setLoading(true);
            const handler = setTimeout(() => {
                fetchMatchingSchemes();
            }, 800);

            return () => {
                clearTimeout(handler);
                setDismissed(false);
            };
        } else {
            setSchemes([]);
            setLoading(false);
        }
    }, [currentCrop, state]); // Re-run if crop or state changes

    const fetchMatchingSchemes = async () => {
        try {
            const response = await api.get(`/schemes?crop=${currentCrop}&state=${state}`);
            setSchemes(response.data);
        } catch (err) {
            console.error("Failed to match schemes", err);
        } finally {
            setLoading(false);
        }
    };

    if (dismissed) return null;

    // Loading State UI Shimmer
    if (loading) {
        return (
            <div className="fixed bottom-10 right-10 z-50 animate-in fade-in duration-300">
                <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-dashed border-primary/30 flex items-center gap-4 w-[340px] shadow-lg animate-pulse">
                    <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="h-2 w-24 bg-neutral-light rounded-full mb-2" />
                        <div className="h-1.5 w-full bg-neutral-light/50 rounded-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (schemes.length === 0) return null;

    const scheme = schemes[0];

    return (
        <div className="mt-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-primary to-green-700 p-[1px] rounded-3xl shadow-lg max-w-full">
                <div className="bg-white rounded-[1.4rem] p-5 relative overflow-hidden flex items-start sm:items-center gap-4">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

                    <div className="bg-primary/10 p-3 rounded-2xl shrink-0">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>

                    <div className="flex-1 pr-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> AI RECOMMENDATION
                            </span>
                        </div>
                        <h4 className="font-bold text-neutral-800 leading-tight mb-1">{scheme.schemeName}</h4>
                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-3">
                            Since you are listing <span className="font-bold text-primary">{currentCrop}</span>, {scheme.description || "you might verify for this scheme."}
                        </p>
                        
                        <a 
                            href={`/dashboard/schemes/${scheme._id}`} 
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center text-xs font-black text-primary hover:text-primary-dark transition-colors uppercase tracking-wider group"
                        >
                            Learn More & Apply <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
                        </a>
                    </div>

                    <button
                        onClick={() => setDismissed(true)}
                        className="absolute top-3 right-3 p-1.5 hover:bg-neutral-light rounded-full transition-colors text-accent/50 hover:text-accent"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ContextualSchemeAlert;
