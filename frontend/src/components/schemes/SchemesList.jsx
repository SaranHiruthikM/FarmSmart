import React, { useEffect, useState } from "react";
import schemesService from "../../services/schemes.service";

const SchemesList = () => {
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        schemesService.getSchemes().then((data) => {
            setSchemes(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="p-4 text-center text-gray-500">Loading schemes...</div>;
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Available Schemes</h2>
            <div className="grid gap-4">
                {schemes.map((scheme) => (
                    <div key={scheme.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-green-700 mb-2">{scheme.name}</h3>
                        <p className="text-gray-600 mb-4">{scheme.description}</p>

                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 text-sm mb-2">Benefits:</h4>
                            <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
                                {scheme.benefits.map((benefit, index) => (
                                    <li key={index}>{benefit}</li>
                                ))}
                            </ul>
                        </div>

                        <a
                            href={scheme.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Apply / More Info
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchemesList;
