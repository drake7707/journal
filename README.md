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


# Run with docker

Run with
```
docker run \
--name journal \
--restart unless-stopped \
-d \
-p 9004:5000 \
-e STORAGE_PATH=/data/entries \
-e DATABASE_PATH=/data/journal.db \
-v /your/host/path/to/store/journal/data:/data \
drake7707/journal
```
Change host port, volume mount path or docker image name as preferred.

Docker image is built automatically through Github CI pipeline so only amd64 architecture is built and pushed automatically, if you want to run it on an ARM device (e.g. raspberry pi), you'll have to check out the code and run `docker build -t drake7707/journal .` first.

# Localization

By default the invariant locale is used, which means that weeks start on a Sunday. This is not always the case. The application takes its locale from the server so you can define your correct locale by setting a few environment variables, for example:

```
ENV TZ=Europe/Brussels
ENV LANG nl_BE.UTF-8
ENV LANGUAGE ${LANG}
ENV LC_ALL ${LANG}
```
(or pass them along with the -e flag in the docker run statement).
