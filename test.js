var http = require('https');

var options = {
    host: 'api.ocbc.com',
    port: 8243,
    path: '/Forex/1.0',
    headers: {
	'Accept': 'application/json',
	'Authorization': 'Bearer f30e2c57bd85bf0cd82bbee49d59fde2'
    }
};

console.log('Start');
http.get(options, function(res) {
    console.log('Connected');
    console.log(res.statusCode);
    res.on("data", function(chunk) {
	forexData = JSON.parse(chunk);
	console.log(forexData.ForexRates[1]);
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});

