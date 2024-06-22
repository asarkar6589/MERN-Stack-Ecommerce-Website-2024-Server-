import { NextFunction, Request, Response } from "express";
import { BaseQueryType, NewProductBody, SearchQuery } from "../types/product.js";
import productModel from "../models/product.js";
import {rm} from "fs";
import MyErrorClass from "../utils/error.js";
import {faker} from "@faker-js/faker";

export const newProduct = async(req:Request<{}, {}, NewProductBody>, res:Response, next:NextFunction) => {
    try {
        const {
            name,
            stock,
            price,
            description,
            category,
            brand
        } = req.body;

        const photo = req.file;

        if (!photo) {
            return res.status(404).json({
                success: false,
                message: 'Please add the photo'
            });
        }

        const productInfo = {
            name,
            stock,
            price,
            photo: photo.path,
            description,
            category,
            brand
        }

        /*
        
            If some gave the photo but failed to give other informations, then the product will not be created but, the photo will be uploaded in the uploads folder, so we have to delete it.
        
        */
        if (!name || !stock || !price || !description || !category || !brand) {
            rm(photo.path, () => {
                console.log("Photo Deleted");
            });
            return res.status(404).json({
                success: false,
                message: 'Please add all the information'
            });
        }

        await productModel.create(productInfo);

        return res.status(201).json({
            success: true,
            message: 'Product created'
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const updateProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        const product = await productModel.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        const {
            name,
            stock,
            price,
            description,
            category,
            brand
        } = req.body;

        console.log(name);
        console.log(stock);

        const photo = req.file;

        if (name) {
            product.name = name;
        }

        if (stock) {
            product.stock = stock
        }

        if (price) {
            product.price = price
        }

        if (description) {
            product.description = description
        }

        if (category) {
            product.category = category
        }

        if (brand) {
            product.brand = brand
        }

        if (photo) {
            rm(product.photo, () => {
                console.log("The Previous photo deleted");
            });
            product.photo = photo.path;
        }

        await product.save();

        return res.status(200).json({
            success: true,
            product
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const deleteProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        const product = await productModel.findById(id);

        if (!product) {
            return next(new MyErrorClass("Product not found", 404));
        }

        rm(product.photo, () => {
            console.log("Photo is deleted");
        });

        await product.deleteOne();

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error:any) {
        return next(new MyErrorClass(error.message || "Internal Server Error", 500));
    }
}

export const singleProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {id} = req.params;

        const product = await productModel.findById(id);

        if (!product) {
            return next(new MyErrorClass("Product not found", 404));
        }

        return res.status(201).json({
            success: true,
            product
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const latestProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const products = await productModel.find({}).limit(8);

        return res.status(201).json({
            success: true,
            products
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const getCategories = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const category = await productModel.distinct("category");

        return res.status(201).json({
            success: true,
            category
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const getBrand = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const brands = await productModel.distinct("brand");

        return res.status(201).json({
            success: true,
            brands
        });
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const searchProduct = async(req:Request<{}, {}, {}, SearchQuery>, res:Response, next:NextFunction) => {
    try {
        const {name, sort, price, category, brand} = req.query;
        const page = Number(req.query.page) || 1;
        const limit = 8; // number_of_products_in_one_Page
        const number_of_skipped_products = (page - 1) * limit;
        const BaseQuery : BaseQueryType = {};

        if (name) {
            BaseQuery.name = {
                $regex: name,
                $options: "i"
            }
        }

        if (price) {
            BaseQuery.price = {
                $lte: Number(price)
            }
        }

        if (category) {
            BaseQuery.category = category
        }

        if (brand) {
            BaseQuery.brand = brand
        }

        const productsPromise = productModel.find(BaseQuery).sort(
            sort ? {
                price: sort === "asc" ? 1 : -1
            } : undefined
        ).limit(limit).skip(number_of_skipped_products);

        /*
        
            we have separately written this for the purpose of pagination only. If we write products with skip and limit, the we will not get the total page number. So we for pagination we want the filtered products but with limit and skip.

        */
        const filteredOnlyProductsPromise = productModel.find(BaseQuery);

        const [products, filteredOnlyProducts] = await Promise.all([
            productsPromise,
            filteredOnlyProductsPromise
        ]);

        const total_pages = Math.ceil(filteredOnlyProducts.length / limit);

        return res.status(200).json({
            success: true,
            products,
            total_pages
        })
    } catch (error:any) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}

export const getAllAdminProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const products = await productModel.find({});

        return res.status(200).json({
            success: true,
            products,
            len: products.length
        });
    } catch (error) {
        return next(new MyErrorClass("Internal Server Error", 500));
    }
}


/*

TODO -> To make some dummy products and check the search functionality. -> Done

dummy function to generate 100 products

const generateRandomProducts = async(count: number = 10) => {
    const products = [];

    for (let i = 0; i < count; i++) {
        const product = {
            name: faker.commerce.productName(),
            photo: "uploads\\8f1e562e-d830-4d23-ae88-f16189e70484.jpg",
            price: faker.commerce.price({min: 1500, max: 80000, dec: 0}),
            stock: faker.commerce.price({min: 0, max: 100, dec: 0}),
            category: faker.commerce.department(),
            createdAt: new Date(faker.date.past()),
            updatedAt: new Date(faker.date.recent()),
            __v: 0
        };

        products.push(product);
    }

    await Product.create(products);

    console.log({
        sucess: true,
    });
};

dummy function to delete dummy products

const deleteRandomProducts = async(count: number = 10) => {
    const products = await Product.find({}).skip(2); // first 2 will be skipped

    for(let i = 0; i < products.length; i++) {
        const product = products[i];
        await product.deleteOne();
    }

    console.log({
        sucess: true,
    });
}

deleteRandomProducts(78);

*/
