var qs = require('querystring')
var http = require('https');

var options = {
    host: 'api.ocbc.com',
    port: 8243,
    path: '/Card_Promotions/1.0',
    headers: {
	'Accept': 'application/json',
	'Authorization': 'Bearer f30e2c57bd85bf0cd82bbee49d59fde2'
    }
};

options.path = options.path + '/?' + qs.stringify({tag: 'petrol', name: 'esso'})

console.log(options.path)

console.log('Start');
http.get(options, function(res) {
    console.log('Connected');
    console.log(res.statusCode);
    res.on("data", function(chunk) {
	cardPromotionData = JSON.parse(chunk);
	console.log(cardPromotionData);
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});

