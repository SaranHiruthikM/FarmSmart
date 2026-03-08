const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
    input: fs.createReadStream('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/Agriculture_price_dataset.csv'),
    terminal: false
});

let count = 0;
rl.on('line', (line) => {
    if (count === 0) { count++; return; }
    const cols = line.split(',');
    const date = cols[9];
    if (date) {
        const day = parseInt(date.split('/')[0]);
        if (day > 12) {
            console.log(`Found date with leading part > 12: ${date}. Format is likely DD/MM/YYYY`);
            process.exit(0);
        }
    }
    count++;
    if (count > 5000) {
        console.log('No date with leading part > 12 found in first 5000 lines.');
        process.exit(0);
    }
});
