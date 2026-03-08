import fs from 'fs';
import readline from 'readline';
import path from 'path';

export type TrendPoint = {
    date: string;
    price: number;
};

export type CsvTrendResponse = {
    crop: string;
    unit: string;
    points: TrendPoint[];
    isSimulated?: boolean;
};

// Base prices for common crops (INR/kg) to use for simulation fallbacks
const BASE_PRICES: Record<string, number> = {
    'potato': 25,
    'tomato': 35,
    'onion': 30,
    'wheat': 22,
    'rice': 45,
    'carrot': 40,
    'cabbage': 20,
    'cauliflower': 30,
    'garlic': 120,
    'ginger': 100,
    'apple': 150,
    'banana': 40,
    'mango': 80,
    'brinjal': 25,
    'lady finger': 35,
    'okra': 35,
    'chillies': 60
};

export const getCsvTrends = async (cropName: string, range: string): Promise<CsvTrendResponse> => {
    const csvPath = path.join(process.cwd(), 'dataset', 'Agriculture_price_dataset.csv');

    const searchCrop = cropName.trim().toLowerCase();
    const allPoints: { date: Date; price: number }[] = [];

    if (fs.existsSync(csvPath)) {
        const fileStream = fs.createReadStream(csvPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let lineCount = 0;
        for await (const line of rl) {
            lineCount++;
            if (lineCount === 1) continue;

            // Simple CSV parsing that handles some common quoting but stays fast
            // For a production app, use 'csv-parse' package
            const cols = parseCsvLine(line);
            if (cols.length < 10) continue;

            const commodity = cols[3]?.trim().toLowerCase();

            // Check for exact OR partial match (e.g., "Potato (Local)" matches "Potato")
            if (commodity === searchCrop || (commodity && searchCrop.includes(commodity)) || (commodity && commodity.includes(searchCrop))) {
                const modalPrice = parseFloat(cols[8]);
                const dateStr = cols[9]?.trim();
                const dateObj = parseCsvDate(dateStr);

                if (!isNaN(modalPrice) && dateObj && !isNaN(dateObj.getTime())) {
                    allPoints.push({ date: dateObj, price: modalPrice });
                }
            }
        }
    }

    if (allPoints.length > 0) {
        // REAL DATA PROCESSING
        allPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
        const latestDate = allPoints[allPoints.length - 1].date;
        const dateLimit = getDateLimit(range, latestDate);

        const pointsByDate: Map<string, number[]> = new Map();
        allPoints.forEach(p => {
            if (p.date >= dateLimit) {
                const isoDate = p.date.toISOString();
                if (!pointsByDate.has(isoDate)) pointsByDate.set(isoDate, []);
                pointsByDate.get(isoDate)?.push(p.price / 100); // Quintal to Kg
            }
        });

        const aggregatedPoints: TrendPoint[] = Array.from(pointsByDate.entries()).map(([date, prices]) => ({
            date,
            price: parseFloat((prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2))
        }));

        aggregatedPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // If we found some data but it's very sparse (e.g., < 3 points), we might still want to simulate 
        // a more complete graph, but for now we return what we found.
        return {
            crop: cropName,
            unit: 'INR/kg',
            points: aggregatedPoints,
            isSimulated: false
        };
    }

    // FALLBACK: SIMULATED DATA
    console.log(`[CsvTrendService] No real data for "${cropName}". Generating simulated market trend.`);
    const simulatedPoints = generateSimulatedData(cropName, range);
    return {
        crop: cropName,
        unit: 'INR/kg',
        points: simulatedPoints,
        isSimulated: true
    };
};

const parseCsvLine = (line: string): string[] => {
    const result: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') inQuotes = !inQuotes;
        else if (char === ',' && !inQuotes) {
            result.push(cur);
            cur = '';
        } else {
            cur += char;
        }
    }
    result.push(cur);
    return result;
};

const getDateLimit = (range: string, baseDate: Date): Date => {
    const limit = new Date(baseDate.getTime());
    const r = range.toLowerCase();
    if (r.includes('30 day')) limit.setDate(limit.getDate() - 30);
    else if (r.includes('6 month')) limit.setMonth(limit.getMonth() - 6);
    else if (r.includes('year')) limit.setFullYear(limit.getFullYear() - 1);
    else limit.setDate(limit.getDate() - 30);
    return limit;
};

const parseCsvDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length < 3) return null;
    let d = parseInt(parts[0]);
    let m = parseInt(parts[1]);
    let y = parseInt(parts[2]);
    if (d > 12) return new Date(y, m - 1, d); // DD/MM/YYYY
    return new Date(y, d - 1, m); // MM/DD/YYYY (User's requirement)
};

const generateSimulatedData = (cropName: string, range: string): TrendPoint[] => {
    const points: TrendPoint[] = [];
    const now = new Date();
    let days = 30;
    const r = range.toLowerCase();
    if (r.includes('180') || r.includes('6 month')) days = 180;
    else if (r.includes('365') || r.includes('year')) days = 365;

    // Determine base price
    const search = cropName.toLowerCase();
    let basePrice = 40; // Default
    for (const [key, val] of Object.entries(BASE_PRICES)) {
        if (search.includes(key)) {
            basePrice = val;
            break;
        }
    }

    // Generate a price trend using a random walk with slight seasonality
    let currentPrice = basePrice * (0.9 + Math.random() * 0.2);
    const volatility = 0.02; // 2% daily fluctuation max
    const drift = (Math.random() - 0.5) * 0.005; // Slight drift up or down

    for (let i = days; i >= 0; i--) {
        const date = new Date(now.getTime());
        date.setDate(date.getDate() - i);

        // Random fluctuation
        const change = 1 + (Math.random() - 0.5) * volatility + drift;
        currentPrice *= change;

        // Add a bit of sine wave for "market cycles"
        const cycles = currentPrice + Math.sin(i / 10) * (basePrice * 0.05);

        points.push({
            date: date.toISOString(),
            price: parseFloat(cycles.toFixed(2))
        });
    }

    return points;
};
