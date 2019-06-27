/* eslint-disable no-case-declarations */
import path from 'path';
import cp from 'child_process';
import config from '../../config';
import logger from '../../logger';
import { downloadedPath } from '../../helpers/publicPath';
import {
  getProfile,
  leaveGroup,
  leaveRoom,
  replyMessage,
  replyText,
  replySticker,
  replyLocation,
  replyAudio,
  replyVideo,
  replyImage,
  downloadContent,
} from '../../helpers/line';

const { baseUrl } = config.server;

// callback function to handle a single event
export const handleEvent = event => {
  const { type, message, replyToken, source } = event;

  // '00000000000000000000000000000000' and 'ffffffffffffffffffffffffffffffff'
  if (replyToken && replyToken.match(/^(.)\1*$/)) {
    return logger.log(`Test verify webhook event recieved: ${JSON.stringify(message)}`);
  }

  switch (type) {
    case 'message':
      switch (message.type) {
        case 'text':
          return handleText(message, replyToken, source);
        case 'image':
          return handleImage(message, replyToken);
        case 'video':
          return handleVideo(message, replyToken);
        case 'audio':
          return handleAudio(message, replyToken);
        case 'location':
          return handleLocation(message, replyToken);
        case 'sticker':
          console.log('sticker');
          return handleSticker(message, replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(replyToken, 'Got followed event');

    case 'unfollow':
      return logger.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return logger.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let postbackData = event.postback.data;
      if (postbackData === 'DATE' || postbackData === 'TIME' || postbackData === 'DATETIME') {
        postbackData += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${postbackData}`);

    case 'beacon':
      const dm = `${Buffer.from(event.beacon.dm || '', 'hex').toString('utf8')}`;
      return replyText(
        replyToken,
        `${event.beacon.type} beacon hwid : ${event.beacon.hwid} with device message = ${dm}`
      );

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
};

async function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseUrl}/static/buttons/1040.jpg`;

  switch (message.text) {
    case 'profile':
      if (source.userId) {
        const profile = await getProfile(source.userId);
        return replyText(replyToken, [
          `Display name: ${profile.displayName}`,
          `Status message: ${profile.statusMessage}`,
        ]);
      }
      return replyText(replyToken, "Bot can't use profile API without user ID");

    case 'buttons':
      return replyMessage(replyToken, {
        type: 'template',
        altText: 'Buttons alt text',
        template: {
          type: 'buttons',
          thumbnailImageUrl: buttonsImageURL,
          title: 'My button sample',
          text: 'Hello, my button',
          actions: [
            { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
            { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
            { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
            { label: 'Say message', type: 'message', text: 'Rice=米' },
          ],
        },
      });

    case 'confirm':
      return replyMessage(replyToken, {
        type: 'template',
        altText: 'Confirm alt text',
        template: {
          type: 'confirm',
          text: 'Do it?',
          actions: [{ label: 'Yes', type: 'message', text: 'Yes!' }, { label: 'No', type: 'message', text: 'No!' }],
        },
      });

    case 'carousel':
      return replyMessage(replyToken, {
        type: 'template',
        altText: 'Carousel alt text',
        template: {
          type: 'carousel',
          columns: [
            {
              thumbnailImageUrl: buttonsImageURL,
              title: 'hoge',
              text: 'fuga',
              actions: [
                { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              ],
            },
            {
              thumbnailImageUrl: buttonsImageURL,
              title: 'hoge',
              text: 'fuga',
              actions: [
                { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                { label: 'Say message', type: 'message', text: 'Rice=米' },
              ],
            },
          ],
        },
      });

    case 'image carousel':
      return replyMessage(replyToken, {
        type: 'template',
        altText: 'Image carousel alt text',
        template: {
          type: 'image_carousel',
          columns: [
            {
              imageUrl: buttonsImageURL,
              action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
            },
            {
              imageUrl: buttonsImageURL,
              action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
            },
            {
              imageUrl: buttonsImageURL,
              action: { label: 'Say message', type: 'message', text: 'Rice=米' },
            },
            {
              imageUrl: buttonsImageURL,
              action: {
                label: 'datetime',
                type: 'datetimepicker',
                data: 'DATETIME',
                mode: 'datetime',
              },
            },
          ],
        },
      });

    case 'datetime':
      return replyMessage(replyToken, {
        type: 'template',
        altText: 'Datetime pickers alt text',
        template: {
          type: 'buttons',
          text: 'Select date / time !',
          actions: [
            { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
            { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
            { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
          ],
        },
      });

    case 'imagemap':
      return replyMessage(replyToken, {
        type: 'imagemap',
        baseUrl: `${baseUrl}/static/rich`,
        altText: 'Imagemap alt text',
        baseSize: { width: 1040, height: 1040 },
        actions: [
          {
            area: { x: 0, y: 0, width: 520, height: 520 },
            type: 'uri',
            linkUri: 'https://store.line.me/family/manga/en',
          },
          {
            area: { x: 520, y: 0, width: 520, height: 520 },
            type: 'uri',
            linkUri: 'https://store.line.me/family/music/en',
          },
          {
            area: { x: 0, y: 520, width: 520, height: 520 },
            type: 'uri',
            linkUri: 'https://store.line.me/family/play/en',
          },
          { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
        ],
        video: {
          originalContentUrl: `${baseUrl}/static/imagemap/video.mp4`,
          previewImageUrl: `${baseUrl}/static/imagemap/preview.jpg`,
          area: {
            x: 280,
            y: 385,
            width: 480,
            height: 270,
          },
          externalLink: {
            linkUri: 'https://line.me',
            label: 'LINE',
          },
        },
      });
    case 'bye':
      // eslint-disable-next-line default-case
      switch (source.type) {
        case 'user':
          return replyText(replyToken, "Bot can't leave from 1:1 chat");
        case 'group':
          return replyText(replyToken, 'Leaving group').then(() => leaveGroup(source.groupId));
        case 'room':
          return replyText(replyToken, 'Leaving room').then(() => leaveRoom(source.roomId));
      }
    // eslint-disable-next-line no-fallthrough
    default:
      logger.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, message.text);
  }
}

async function handleImage(message, replyToken) {
  let getContent;
  const { contentProvider } = message;
  if (contentProvider.type === 'line') {
    const downloadPath = path.join(downloadedPath, `${message.id}.jpg`);
    const previewPath = path.join(downloadedPath, `${message.id}-preview.jpg`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`magick convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

      return {
        originalContentUrl: `${baseUrl}/downloaded/${path.basename(downloadPath)}`,
        previewImageUrl: `${baseUrl}/downloaded/${path.basename(previewPath)}`,
      };
    });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  const { originalContentUrl, previewImageUrl } = await getContent;

  return replyImage(replyToken, {
    originalContentUrl,
    previewImageUrl,
  });
}

async function handleVideo(message, replyToken) {
  let getContent;
  const { contentProvider } = message;
  if (contentProvider.type === 'line') {
    const downloadPath = path.join(downloadedPath, `${message.id}.mp4`);
    const previewPath = path.join(downloadedPath, `${message.id}-preview.jpg`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`magick convert mp4:${downloadPath}[0] jpeg:${previewPath}`);
      return {
        originalContentUrl: `${baseUrl}/downloaded/${path.basename(downloadPath)}`,
        previewImageUrl: `${baseUrl}/downloaded/${path.basename(previewPath)}`,
      };
    });
  } else if (message.contentProvider.type === 'external') {
    getContent = Promise.resolve(message.contentProvider);
  }

  const { originalContentUrl, previewImageUrl } = await getContent;

  return replyVideo(replyToken, {
    originalContentUrl,
    previewImageUrl,
  });
}

async function handleAudio(message, replyToken) {
  let getContent;
  const { contentProvider } = message;
  if (contentProvider.type === 'line') {
    const downloadPath = path.join(downloadedPath, `${message.id}.m4a`);

    getContent = downloadContent(message.id, downloadPath).then(downloadPath => ({
      originalContentUrl: `${baseUrl}/downloaded/${path.basename(downloadPath)}`,
    }));
  } else {
    getContent = Promise.resolve(message.contentProvider);
  }

  const { originalContentUrl } = await getContent;
  return replyAudio(replyToken, {
    originalContentUrl,
    duration: message.duration,
  });
}

function handleLocation(message, replyToken) {
  const { title, address, latitude, longitude } = message;
  return replyLocation(replyToken, { title, address, latitude, longitude });
}

function handleSticker(message, replyToken) {
  console.log(message);
  const { packageId, stickerId } = message;
  return replySticker(replyToken, { packageId, stickerId });
}
