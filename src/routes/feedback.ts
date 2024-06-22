import express from 'express';
import { newFeedback } from '../controllers/feedback.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

router.route("/new").post(isAuthenticated, newFeedback);

export default router;
