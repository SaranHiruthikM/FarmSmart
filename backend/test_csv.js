const { getCsvTrends } = require('./src/services/csvTrendService');
const path = require('path');

// Mock process.cwd() if needed or just run from root
async function test() {
    try {
        const result = await getCsvTrends('Potato', '30 days');
        console.log('Result count:', result.points.length);
        if (result.points.length > 0) {
            console.log('First point:', result.points[0]);
            console.log('Last point:', result.points[result.points.length - 1]);
        }
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
