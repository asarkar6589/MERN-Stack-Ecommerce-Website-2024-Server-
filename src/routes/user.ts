import express from "express";
import {
  deleteUser,
  forgetPassword,
  getAllUser,
  getUser,
  loginUser,
  logoutUser,
  newUser,
  resetPassword,
  updateUser,
} from "../controllers/user.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { sinlgeUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/new").post(sinlgeUpload, newUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router.route("/account").get(isAuthenticated, getUser);
router.route("/all").get(isAuthenticated, isAdmin, getAllUser);
router.route("/forgetpassword").post(forgetPassword); // here we dont want isAuthenticated because is the user is calling this api, means the user is not verified.
router.route("/resetpassword/:token").put(resetPassword);
router.route("/delete/:id").delete(isAuthenticated, isAdmin, deleteUser);
router.route("/:id").put(isAuthenticated, sinlgeUpload, updateUser);

export default router;
