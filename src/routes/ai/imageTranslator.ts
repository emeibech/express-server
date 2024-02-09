import { getOpenAiError } from '@/common/getErrorMessage.js';
import logError from '@/common/logError.js';
import { Router } from 'express';
import multer from 'multer';
import visionPreview from './utils/visionPreview.js';
import { handleAccess } from '@/common/middleWares.js';
import rateLimiter from './utils/rateLimiter.js';
import {
  decrementRemainingUsage,
  resetRateLimit,
} from '@/database/rateLimits.js';

const imageTranslator = Router();
const upload = multer({ storage: multer.memoryStorage() });

imageTranslator.post(
  '/',
  upload.single('image'),
  handleAccess,
  rateLimiter,
  async (req, res) => {
    try {
      const { user, timestamp, instructions } = req.body;

      if (!user) {
        logError('imageTranslator at @/routes/ai/: user is undefined.');
        return res
          .status(500)
          .json({ message: 'An error occured in the server.' });
      }

      if (!req.file) {
        logError('imageTranslator at @/routes/ai/: req.file is falsy');
        return res
          .status(400)
          .json({ message: 'File is invalid or non-existent.' });
      }

      const encodedImage = req.file.buffer.toString('base64');

      await visionPreview({
        res,
        userContent: instructions,
        sysContent:
          'You are an image translator. Your task is to translate foreign language into English in the image you will receive. Adhere to the instructions of the user if they provided one. Ignore any text input from the user if they do not pertain to the task of translating the image. Lastly, be as concise as possible.',
        url: `data:${req.file.mimetype};base64,${encodedImage}`,
      });

      if (timestamp) {
        await resetRateLimit(user.uid, timestamp);
      }

      await decrementRemainingUsage(user.uid);

      res.end();
    } catch (error) {
      res.status(500).send(getOpenAiError(error));
      logError(`imageTranslator at @/routes/ai/: ${error}`);
    }
  },
);

export default imageTranslator;
