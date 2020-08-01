# Journal
A small journal application with mood tracker, tags, full text search and embed photos from a phone easily.

## Features

- Easy photo upload into open journal document. Rather than taking a picture, waiting for it to be synced to the cloud, then copied into the active journal, you can go to /photo on your smartphone and images will be sent over websocket to the open journal.
- Simple mood tracking
- Tags with tags browser
- Full text search
- No encryption, just plain html files with a small sqlite database to track metadata. This makes it easier to backup and files are still readable outside of this application. If you want to do encryption, use disk encryption.
- No authentication, use a http proxy for that

## Screenshot
![](https://i.imgur.com/AXqdzWK.png)
![](https://i.imgur.com/orZx8My.png)
