const fs = require('fs');
const lines = fs.readFileSync('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/Agriculture_price_dataset.csv', 'utf8').split('\n');
const potatoLines = lines.filter(l => l.includes(',Potato,')).slice(0, 20);
fs.writeFileSync('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/potato_check.txt', potatoLines.join('\n'));
