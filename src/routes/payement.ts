import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { createPayementIntent } from '../controllers/payement.js';

const router = express.Router();

router.route("/new").post(isAuthenticated, createPayementIntent);

export default router;