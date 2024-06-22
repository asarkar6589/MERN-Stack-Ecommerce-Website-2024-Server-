import express from "express";
import { deleteUser, getAllUser, getUser, loginUser, logoutUser, newUser, updateUser } from "../controllers/user.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { sinlgeUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/new").post(sinlgeUpload, newUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/account").get(isAuthenticated, getUser);
router.route("/all").get(isAuthenticated, isAdmin, getAllUser);
router.route("/delete/:id").delete(isAuthenticated, isAdmin, deleteUser);
router.route("/:id").put(isAuthenticated,sinlgeUpload, updateUser);

export default router;
