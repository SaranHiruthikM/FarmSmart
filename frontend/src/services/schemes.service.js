
const schemesData = [
    {
        id: 1,
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        description: "Crop insurance scheme to provide financial support to farmers suffering crop loss/damage arising out of unforeseen events.",
        benefits: [
            "Financial support for crop loss",
            "Stabilizes income",
            "Encourages innovative practices"
        ],
        applyLink: "https://pmfby.gov.in/"
    },
    {
        id: 2,
        name: "Pradhan Mantri Krishi Sinchai Yojana (PMKSY)",
        description: "Scheme to improve on-farm water use efficiency through a focused approach.",
        benefits: [
            "Expand cultivable area",
            "Improve water use efficiency",
            "Enhance recharge of aquifers"
        ],
        applyLink: "https://pmksy.gov.in/"
    },
    {
        id: 3,
        name: "Soil Health Card Scheme",
        description: "Government is issuing Soil Health Cards to farmers which will carry crop-wise recommendations of nutrients and fertilizers.",
        benefits: [
            "Check soil health status",
            "Optimize fertilizer usage",
            "Increase crop yield"
        ],
        applyLink: "https://soilhealth.dac.gov.in/"
    }
];

const eligibleSchemesData = [
    {
        id: 1,
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        matchReason: "Matches your crop type and region."
    },
    {
        id: 3,
        name: "Soil Health Card Scheme",
        matchReason: "Available for all farmers in your state."
    }
];

const advisoryData = [
    {
        id: 1,
        type: "tip",
        title: "Pest Control for Wheat",
        content: "Monitor for aphids regularly. Use neem oil spray if infestation is low.",
        date: "2023-10-25"
    },
    {
        id: 2,
        type: "weather",
        title: "Heavy Rainfall Alert",
        content: "Expect heavy rainfall in the next 48 hours. Ensure proper drainage in fields.",
        date: "2023-10-26"
    },
    {
        id: 3,
        type: "seasonal",
        title: "Winter Sowing",
        content: "Optimal time for sowing rabi crops like mustard and gram.",
        date: "2023-10-20"
    }
];

const schemesService = {
    getSchemes: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(schemesData), 500);
        });
    },
    getEligibleSchemes: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(eligibleSchemesData), 800);
        });
    },
    getAdvisory: async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(advisoryData), 600);
        });
    }
};

export default schemesService;
