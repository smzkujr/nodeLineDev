'use strict';

const https = require('https');
const twitter = require('twitter');

const twitter_client = new twitter({
	consumer_key: 'Vfk1x22izrZoPMRqYuWn0voit',
	consumer_secret: 'MwLcekmLk7CXjHHZlXRroWGwMb5XE7oE0dzP3afRQ4sXtUe66b',
	access_token_key: '3819819252-tUZVEcrJE1THnhyBUpaMb6Gztnq1Ve4qN8mJhRX',
	access_token_secret: 'T1qMXavHztfpB2KGqdib7H8btFdiVytOjT2GVllJenJNv'
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
	if (result.message.type == "text") {

		console.log(result);
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
							"imageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRoOYethc6eFEJGPPzd2iYSiJZOZxGW17vl9BpUPmL6MeoRVJR",
							"action": {
								"type": "uri",
								"uri": "http://www.earthlink.co.jp/"
							}
						}]
					}
				}]
			};
			send(message, () => {
				callback();
			});
		} else if(result.message.text == "あああ") {
			let content = event.events[0] || {};
			// send(message, () => {
			// 	callback();
			// });
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
