var http = require('https')
var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()
var qs = require('querystring')

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200))
	    if (text.toLowerCase() == 'forex') {
		sendTextMessage(sender, "Querying OCBC forex rates...")
		generateForexMessage(sender)
		continue
	    }
	    if (text.toLowerCase() == 'promotion esso petrol') {
		sendTextMessage(sender, "Querying OCBC Credit Card promotions...")
		generatePromotionMessage(sender)
		continue
	    }
        }
    }
    res.sendStatus(200)
})

var token = 'EAAEm40YK4YEBAO6q8vnc4RyqMolkInHp87D4ouC4Qs9jj2d0U0nc6uxxZBZB8aQBBGLVcaM0GVKO86OycjWclf0SXHI0VJf5yNMeSqA1jCCwzIarSXwIdThE4ZAyXxuDb49qeeD3NqvGUOfVU4lSS8TIA9ROLNiUUDE4xJliJjKWXIVVZCzD'

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function generateForexMessage(sender) {
    var options = {
        host: 'api.ocbc.com',
        port: 8243,
        path: '/Forex/1.0',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer f30e2c57bd85bf0cd82bbee49d59fde2'
        }
    }
    http.get(options, function(res) {
        res.on("data", function(chunk) {
            forexData = JSON.parse(chunk);
	    sendForexMessage(sender, "Hi, OCBC buying at " + JSON.stringify(forexData.ForexRates[0].bankBuyingRateTT) + " and selling at " + JSON.stringify(forexData.ForexRates[0].bankSellingRate) + " for " + JSON.stringify(forexData.ForexRates[0].fromCurrency) + " to " + JSON.stringify(forexData.ForexRates[0].toCurrency) + ", units of " + JSON.stringify(forexData.ForexRates[0].unit) + ".");
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

function sendForexMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


function generatePromotionMessage(sender) {
    var options = {
        host: 'api.ocbc.com',
        port: 8243,
        path: '/Card_Promotions/1.0',
        headers: {
            'Accept': 'application/json',
            'Authorization': 'Bearer f30e2c57bd85bf0cd82bbee49d59fde2'
        }
    }
    options.path = options.path + '?' + qs.stringify({tag: 'petrol', name: 'esso'})
    http.get(options, function(res) {
        res.on("data", function(chunk) {
            promotionData = JSON.parse(chunk);
	    sendPromotionMessage(sender, promotionData)
        });
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
}

function sendPromotionMessage(sender, promotionData) {
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
			'url': 'default_web_url_',
			'title': 'web url'
		    }]
		}]
	    }
	}
    }
    // Edit message data with promotion data
    messageData.attachment.payload.elements[0].title = promotionData.promotions[0].name
    messageData.attachment.payload.elements[0].subtitle = promotionData.promotions[0].shortDesc
    messageData.attachment.payload.elements[0].image_url = 'https://i.imgur.com/RA9z484.png'
    messageData.attachment.payload.elements[0].buttons[0].url = promotionData.promotions[0].website 
    messageData.attachment.payload.elements[0].buttons[0].title = 'Visit ' + promotionData.promotions[0].name    

request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}


