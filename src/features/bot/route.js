import express from 'express';
import { lineMiddleware } from '../../helpers/line';
import { webhookController } from './controller';

const router = express.Router();

router.post('/webhook', lineMiddleware, webhookController);

export default router;
