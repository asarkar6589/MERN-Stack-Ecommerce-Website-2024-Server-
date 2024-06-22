import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getAllCancelledOrder, getCancelledOrderById, updateCancelledOrder } from "../controllers/deletedOrder.js";

const router = express.Router();

router.route("/all").get(isAuthenticated, isAdmin, getAllCancelledOrder);
router.route("/:id").put(isAuthenticated, isAdmin, updateCancelledOrder).get(isAuthenticated, isAdmin, getCancelledOrderById);

export default router;
