const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
    input: fs.createReadStream('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/Agriculture_price_dataset.csv'),
    terminal: false
});

rl.on('line', (line) => {
    const cols = line.split(',');
    cols.forEach((col, i) => console.log(`${i}: ${col}`));
    process.exit(0);
});
