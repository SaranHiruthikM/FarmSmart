import React, { useState } from "react";
import schemesService from "../../services/schemes.service";
import { CheckCircle, Loader2 } from "lucide-react";

const EligibilityChecker = () => {
    const [checking, setChecking] = useState(false);
    const [eligibleSchemes, setEligibleSchemes] = useState(null);

    const handleCheck = () => {
        setChecking(true);
        setEligibleSchemes(null); // Reset previous results
        schemesService.getEligibleSchemes().then((data) => {
            setEligibleSchemes(data);
            setChecking(false);
        });
    };

    return (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-100 mb-6">
            <h3 className="text-lg font-bold text-green-800 mb-2">Eligibility Checker</h3>
            <p className="text-sm text-green-700 mb-4">Check which government schemes you are eligible for based on your profile.</p>

            {!eligibleSchemes && !checking && (
                <button
                    onClick={handleCheck}
                    className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                    Am I Eligible?
                </button>
            )}

            {checking && (
                <div className="flex items-center justify-center p-4 text-green-600">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Checking eligibility...</span>
                </div>
            )}

            {eligibleSchemes && (
                <div className="animate-fade-in-up">
                    <div className="flex items-center gap-2 text-green-700 font-medium mb-3">
                        <CheckCircle className="w-5 h-5" />
                        <span>You are eligible for {eligibleSchemes.length} schemes!</span>
                    </div>
                    <div className="space-y-3">
                        {eligibleSchemes.map((scheme) => (
                            <div key={scheme.id} className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                                <p className="font-semibold text-gray-800 text-sm">{scheme.name}</p>
                                <p className="text-xs text-gray-500 mt-1">{scheme.matchReason}</p>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleCheck}
                        className="mt-4 text-xs text-green-600 font-medium hover:underline"
                    >
                        Check again
                    </button>
                </div>
            )}
        </div>
    );
};

export default EligibilityChecker;
