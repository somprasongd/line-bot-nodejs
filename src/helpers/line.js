import { Client, middleware } from '@line/bot-sdk';
import fs from 'fs';
import config from '../config';

export const lineMiddleware = middleware(config.line);

// create LINE SDK client
const client = new Client(config.line);

export const getProfile = userId => client.getProfile(userId);

export const leaveGroup = groupId => client.leaveGroup(groupId);

export const leaveRoom = roomId => client.leaveRoom(roomId);

export const replyMessage = (token, message) => client.replyMessage(token, message);

export const replyText = (token, texts) => {
  const replyTexts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(token, replyTexts.map(text => ({ type: 'text', text })));
};

export const replyImage = (token, { originalContentUrl, previewImageUrl }) =>
  client.replyMessage(token, {
    type: 'image',
    originalContentUrl,
    previewImageUrl,
  });

export const replyVideo = (token, { originalContentUrl, previewImageUrl }) =>
  client.replyMessage(token, {
    type: 'video',
    originalContentUrl,
    previewImageUrl,
  });

export const replyAudio = (token, { originalContentUrl, duration }) =>
  client.replyMessage(token, {
    type: 'audio',
    originalContentUrl,
    duration,
  });

export const replyLocation = (token, { title, address, latitude, longitude }) =>
  client.replyMessage(token, {
    type: 'location',
    title,
    address,
    latitude,
    longitude,
  });

export const replySticker = (token, { packageId, stickerId }) =>
  client.replyMessage(token, {
    type: 'sticker',
    packageId,
    stickerId,
  });

export const downloadContent = (messageId, downloadPath) =>
  client.getMessageContent(messageId).then(
    stream =>
      new Promise((resolve, reject) => {
        const writable = fs.createWriteStream(downloadPath);
        stream.pipe(writable);
        stream.on('end', () => resolve(downloadPath));
        stream.on('error', reject);
      })
  );

export default client;
