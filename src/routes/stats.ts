import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { getBarChartData, getDashBoardData, getLineChartData, getPieChartData } from "../controllers/stats.js";

const router = express.Router();

router.route("/dashboard").get(isAuthenticated, isAdmin, getDashBoardData);
router.route("/pie").get(isAuthenticated, isAdmin, getPieChartData);
router.route("/bar").get(isAuthenticated, isAdmin, getBarChartData);
router.route("/line").get(isAuthenticated, isAdmin, getLineChartData);

export default router;
