# rocketchat-dump
rocket.chat の会話ログをHTMLとしてダンプするスクリプト

# Usage
1. https://rocket.chat/docs/installation/manual-installation/ubuntu/snaps/#how-do-i-backup-my-snap-data に従って、チャットのデータをダンプします。
2. `index.js` の `bsonDirectoryPath` と `outputDrectoryPath` をソースコード内のコメントに従って書き換えます。
3. `npm install` し、 `node index.js` を実行します。
