import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { commentByProduct, deleteComment, getCommentById, newComment, updateComment } from '../controllers/comments.js';

const router = express.Router();

router.route("/new").post(isAuthenticated, newComment);
router.route("/delete").delete(isAuthenticated, deleteComment);
router.route("/all").get(commentByProduct);
router.route("/:id").put(isAuthenticated, updateComment).get(isAuthenticated, getCommentById);

export default router;
