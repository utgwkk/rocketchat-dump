'use strict';

// Rocket.Chat のダンプファイルがあるディレクトリへのパス
const bsonDirectoryPath = '/path/to/var/snap/rocketchat-server/1232/dump/parties/'

// ログを出力したいディレクトリへのパス
const outputDirectoryPath = '/path/to/output/'

/*
 * 設定ここまで
 */

const BSONStream = require('bson-stream')
    , fs = require('fs')
    , path = require('path')
;

// TODO: backup.tgz を渡したらよしなにやってくれるようにしたい

const roomBsonFilePath = path.join(bsonDirectoryPath, 'rocketchat_room.bson');
const roomBsonPipe = fs.createReadStream(roomBsonFilePath).pipe(new BSONStream());

const messageBsonFilePath = path.join(bsonDirectoryPath, 'rocketchat_message.bson');
const messageBsonPipe = fs.createReadStream(messageBsonFilePath).pipe(new BSONStream());

// public roomのid -> 名前 の写像
const roomMap = {};
const messages = {};

// roomの情報を取得する
roomBsonPipe.on('data', (data) => {
    // public roomだけ対応関係を記録する
    if (data.t === 'c') {
        console.log(data._id, data.name);
        roomMap[data._id] = data.name;
    }
});

roomBsonPipe.on('end', () => {
    messageBsonPipe.on('data', (data) => {
        const roomId = data.rid;

        // public roomの発言でないものは除外する
        if (!(roomId in roomMap))
            return;

        const roomName = roomMap[roomId];

        // roomに対応する発言ログが初出のときは新しいArrayを作る
        if (messages[roomName] === undefined)
            messages[roomName] = new Array();

        // 発言ログは data.t === undefined となる
        if (data.t === undefined) {
            messages[roomName].push(data);
        }
    });
});

// 発言ログを全て読み込んだらファイルに書き出す
messageBsonPipe.on('end', () => {
    for (const roomName in messages) {
        const destinationPath = path.join(outputDirectoryPath, `log-${roomName}.html`);

        // (発言者の名前): (発言内容)
        const data = messages[roomName]
            .map(d => `${d.u.username}: ${d.msg}`)
            .join("\n");

        // plain textだと文字化けが発生しうるので
        // preタグでくるんだHTMLにしている
        const output = `
            <!DOCTYPE html>
            <meta charset="utf-8">
            <pre>${data}</pre>
        `;
        fs.writeFile(destinationPath, output);
    }
});
