import express from "express";
import { 
    deleteProduct, 
    getAllAdminProducts, 
    getBrand, 
    getCategories, 
    latestProduct, 
    newProduct, 
    searchProduct, 
    singleProduct, 
    updateProduct
} from "../controllers/product.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { isAdmin } from "../middlewares/isAdmin.js";
import { sinlgeUpload } from "../middlewares/multer.js";

const router = express.Router();

router.route("/admin/new").post(isAuthenticated, isAdmin, sinlgeUpload, newProduct);

router.route("/admin/allProducts").get(isAuthenticated, isAdmin, getAllAdminProducts);

router.route("/latest").get(latestProduct);

router.route("/categories").get(getCategories);

router.route("/brand").get(getBrand);

router.route("/all").get(searchProduct);

router.route("/:id")
.get(singleProduct)
.put(isAuthenticated, isAdmin, sinlgeUpload,updateProduct)
.delete(isAuthenticated, isAdmin, deleteProduct);

export default router;  
