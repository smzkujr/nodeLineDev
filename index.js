'use strict';

const https = require('https');
const twitter = require('twitter');

const twitter_client = new twitter({
	consumer_key: CONSUMER_KEY,
	consumer_secret: CONSUMER_SECRET,
	access_token_key: ACCESS_TOKEN_KEY,
	access_token_secret: ACCESS_TOKEN_SECRET
});

let send = (data, callback) => {
	let body = JSON.stringify(data);

	let req = https.request({
		hostname: "api.line.me",
		port: 443,
		path: "/v2/bot/message/reply",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(body),
			"Authorization": "Bearer " + process.env.CHANNEL_ACCESS_TOKEN
		}
	});

	req.end(body, (err) => {
		err && console.log(err);
		callback(err);
	});
}

exports.handler = (event, context, callback) => {
	let result = event.events && event.events[0];
	let result_text = result.message.text;
console.log(result_text);

	if (result.message.type == "text") {
		if (result.message.text == "アースリンク") {
			let content = event.events[0] || {};
			let message = {
				"replyToken":result.replyToken,
				"messages": [{
					"type": "template",
					"altText": "this is a image carousel template",
					"template": {
						"type": "image_carousel",
						"columns": [{
							"imageUrl": "http://www.earthlink.co.jp/common/img/common/logo.jpg",
							"action": {
								"type": "uri",
								"uri": "https://www.earthlink.co.jp/"
							}
						}]
					}
				}]
			};
			send(message, () => {
				callback();
			});
		} else if(result_text.charAt(0) == "@") {
			let user_params = {count: 1};
			if(result_text.charAt(1) == "s") {
				user_params = {count: 1, screen_name: 'smzkujr2'};
			} else if(result_text.charAt(1) == "m") {
				user_params = {count: 1, screen_name: 'meg_yamayoung'};
			} else if(result_text.charAt(1) == "A") {
				user_params = {count: 1, screen_name: 'AbeShinzo'};
			}
			console.log(user_params);
			twitter_client.get('statuses/home_timeline', user_params, function(error, tweets, response) {
				console.log(tweets)
				let content = event.events[0] || {};
				console.log(content);
				let message = {
					"replyToken":result.replyToken,
					"messages": [
						{
							"type": "text",
							"text": tweets[0].user.name + '@' + tweets[0].user.screen_name + '\n\n' + tweets[0].text
						}
					]
				};
				console.log(message);
				send(message, () => {
					callback();
				});
			})
		} else {
			let content = event.events[0] || {};
			let message = {
				"replyToken":result.replyToken,
				"messages": [
					{
						"type": "text",
						"text": content.message.text
					}
				]
			};
			send(message, () => {
				callback();
			});
		}
	} else if (result.message.type == "sticker") {
		let content = event.events[0] || {};
		let message = {
			"replyToken":result.replyToken,
			"messages": [
				{
					"type": "sticker",
					"packageId":content.message.packageId,
					"stickerId":content.message.stickerId
				}
			]
		};
		send(message, () => {
			callback();
		});
	} else {
		callback();
	}
};
