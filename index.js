// Strictモード
'use strict';

// モジュール定義
const https = require('https');
const twitter = require('twitter');

// Twitter認証
const twitter_client = new twitter({
	consumer_key: process.env.CONSUMER_KEY,
	consumer_secret: process.env.CONSUMER_SECRET,
	access_token_key: process.env.ACCESS_TOKEN_KEY,
	access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// LINEリクエストヘッダ
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

// LINEリクエストボディの生成
exports.handler = (event, context, callback) => {
	let result = event.events && event.events[0];
	let result_text = result.message.text;

	if(result.message.type == "text") {
		if(result_text == "テレマーケティングシステム Sakura") {
			let content = event.events[0] || {};
			let message = {
				"replyToken":result.replyToken,
				"messages": [{
					"type": "template",
					"altText": "Earth Link Logo Image",
					"template": {
						"type": "image_carousel",
						"columns": [{
							"imageUrl": "https://cdn.it-trend.jp/products/4875/current/logo?1491389610",
							"action": {
								"type": "uri",
								"uri": "https://www.earthlink.co.jp/sakura/"
							}
						}]
					}
				}]
			};
			send(message, () => { callback(); });
		} else if(result_text == "botと簡単なコミュニケーションが取れますね。") {
			let content = event.events[0] || {};
			let message = {
				"replyToken":result.replyToken,
				"messages": [{
					"type": "text",
					"text": "なるほど。"
				}]
			};
			send(message, () => { callback(); });
		} else if(result_text.charAt(0) == "@") {
			// Twitter APIコール
			let user_params = {count: 1, screen_name: result_text.slice(0)};
			twitter_client.get('statuses/user_timeline', user_params, function(error, tweets, response) {
				let content = event.events[0] || {};
				if(error) {
					let message = {
						"replyToken":result.replyToken,
						"messages": [{
								"type": "text",
								"text": "指定したユーザが存在しないか、\nツイートの公開を承認されていません。"
						}]
					};
					send(message, () => { callback(); });
				// 投稿を取得して返却
				} else {
					let created_at = tweets[0].created_at.split(' ');
					let post_date  = created_at[5] + " " + created_at[1] + " " + created_at[2] + " " + created_at[0] + " " + created_at[3] + " +0900" ;
					let message = {
						"replyToken":result.replyToken,
						"messages": [{
							"type": "text",
							"text": tweets[0].user.name + ' @' + tweets[0].user.screen_name + '\n' + post_date + '\n\n' + tweets[0].text
						}]
					};
				send(message, () => { callback(); });
				}
			})
		// リクエストと同じTextを返却
		} else {
			let content = event.events[0] || {};
			let message = {
				"replyToken":result.replyToken,
				"messages": [{
					"type": "text",
					"text": content.message.text
				}]
			};
			send(message, () => { callback(); });
		}
	// リクエストと同じStickerを返却
	} else if(result.message.type == "sticker") {
		let content = event.events[0] || {};
		let message = {
			"replyToken":result.replyToken,
			"messages": [{
				"type": "sticker",
				"packageId":content.message.packageId,
				"stickerId":content.message.stickerId
			}]
		};
		send(message, () => { callback(); });
	} else {
		callback();
	}
};
