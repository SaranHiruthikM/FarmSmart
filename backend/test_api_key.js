const https = require('https');

const API_KEY = '579b464db66ec23bdd00000161245768babf47d7703f845a3fceac2e';
const RESOURCE_ID = '9ef84268-d588-465a-a308-a864a43d0070';
const URL = `https://api.data.gov.in/resource/${RESOURCE_ID}?api-key=${API_KEY}&format=json&limit=10&sort[arrival_date]=desc`;

console.log('Fetching from:', URL);

https.get(URL, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Status:', json.status);
      console.log('Records count:', json.records ? json.records.length : 0);
      if (json.records && json.records.length > 0) {
        console.log('Sample Record:', json.records[0]);
      } else {
          console.log('Full Response:', JSON.stringify(json, null, 2));
      }
    } catch (e) {
      console.error('Error parsing JSON:', e.message);
      console.log('Raw output:', data);
    }
  });

}).on('error', (err) => {
  console.error('Error: ' + err.message);
});