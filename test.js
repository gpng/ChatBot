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
	console.log('Parsing promotion data...')
	cardPromotionData = JSON.parse(chunk);
	console.log(cardPromotionData)
	generateMessageData(cardPromotionData)
    });
}).on('error', function(e) {
    console.log("Got error: " + e.message);
});

function generateMessageData(promotionData) {
    console.log('Generating Message Data...')
    messageData = {
        'attachment': {
            'type': 'template',
            'payload': {
                'template_type': 'generic',
                'elements': [{
                    'title': 'First Card',
                    'subtitle': 'Element #1 of an hscroll',
                    'image_url': 'default_image_url',
                    'buttons': [{
                        'type': 'web_url',
                        'url:': 'default_web_url_',
                        'title': 'web url'
                    }]
                }]
            }
        }
    }
    // Edit message data with promotion data
    messageData.attachment.payload.elements[0].title = promotionData.promotions[0].name
    messageData.attachment.payload.elements[0].subtitle = promotionData.promotions[0].shortDesc
    messageData.attachment.payload.elements[0].image_url = promotionData.promotions[0].smallImg
    messageData.attachment.payload.elements[0].buttons[0].url = promotionData.promotions[0].website
    console.log(JSON.stringify(messageData))
}
