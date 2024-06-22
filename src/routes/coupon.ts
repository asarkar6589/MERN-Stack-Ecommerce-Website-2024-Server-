import express from 'express';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { checkCoupon, deletecoupon, getAllCoupons, getCouponById, newCoupon, updateCoupon } from '../controllers/coupon.js';

const router = express.Router();

router.route("/new").post(isAuthenticated, isAdmin, newCoupon);
router.route("/all").get(isAuthenticated, isAdmin, getAllCoupons);
router.route("/check/:name").get(isAuthenticated, checkCoupon);
router.route("/:id").get(isAuthenticated, isAdmin, getCouponById).delete(isAuthenticated, isAdmin, deletecoupon).put(isAuthenticated, isAdmin, updateCoupon);

export default router;
