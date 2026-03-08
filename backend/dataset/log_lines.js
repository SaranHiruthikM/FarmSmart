const fs = require('fs');
const lines = fs.readFileSync('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/Agriculture_price_dataset.csv', 'utf8').split('\n').slice(0, 10);
fs.writeFileSync('c:/Users/Vimal_Sabari/OneDrive/Desktop/FarmSmart NEW/FarmSmart/backend/dataset/first_lines.txt', lines.join('\n'));
