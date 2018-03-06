'use strict';

const https = require('https');

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
  if (result) {
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
  } else {
    callback();
  }
};
