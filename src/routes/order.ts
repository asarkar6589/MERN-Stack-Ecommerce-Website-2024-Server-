import express from "express";
import { deleteOrderByUser, getAllAdminOrders, getOrderByAdminId, getOrderById, getOrderByUser, newOrder, updateOrderByAdmin } from "../controllers/order.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.route("/new").post(isAuthenticated, newOrder);
router.route("/all").get(isAuthenticated, getOrderByUser);
router.route("/admin/all").get(isAuthenticated, isAdmin, getAllAdminOrders);
router.route("/admin/update/:id").put(isAuthenticated, isAdmin, updateOrderByAdmin);
router.route("/delete/:id").delete(isAuthenticated, deleteOrderByUser);
router.route("/admin/:id").get(isAuthenticated, isAdmin, getOrderByAdminId);
router.route("/:id").get(isAuthenticated, getOrderById);

/*

Todo -> Make 2 routes, the first one is only admin can see all the order by id and the second one is only the person who ordered something can see the order.

*/

export default router;

