const qualityService = {
    // Mock logic for price impact based on grade
    // A: +15%, B: 0%, C: -10%
    getPriceImpact: async (grade, basePrice) => {
        const price = parseFloat(basePrice);
        if (isNaN(price)) return 0;

        let multiplier = 1;
        if (grade === 'A') multiplier = 1.15;
        else if (grade === 'C') multiplier = 0.9;

        const finalPrice = price * multiplier;
        return {
            basePrice: price,
            finalPrice: parseFloat(finalPrice.toFixed(2)),
            impact: parseFloat((finalPrice - price).toFixed(2)),
            percentage: grade === 'A' ? 15 : grade === 'C' ? -10 : 0
        };
    },

    // Quality hints for tooltips
    getGradeHints: () => ({
        A: "Premium: Fresh, uniform size, no defects.",
        B: "Standard: Good quality, minor size variations or defects.",
        C: "Low: Visible defects, uneven size, suitable for processing."
    })
};

export default qualityService;
