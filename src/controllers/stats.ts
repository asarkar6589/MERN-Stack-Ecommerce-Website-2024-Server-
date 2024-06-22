import { NextFunction, Request, Response } from "express";
import { deletedOrderModel } from "../models/deletedOrder.js";
import { orderModel } from "../models/order.js";
import productModel from "../models/product.js";
import { UserModel } from "../models/user.js";
import { calculatePercentage, createArray } from "../utils/features.js";

export const getDashBoardData = async(req:Request, res:Response, next:NextFunction) => {
    let stats = {};
    /*
    
        First we have to get the percentage of the absolute difference between products created in the present month and products created in the last month.

        So we have the present month and the last month, so we can get how many products are created using the dates, and can take the absolute difference between them and can get the percentage.
    
    */
    const today = new Date();

    const lastSixMonths = new Date();
    lastSixMonths.setMonth(lastSixMonths.getMonth() - 6);

    const thisMonth = {
        start: new Date(today.getFullYear(), today.getMonth(), 1), // starting date
        end: today // ending date
    }

    const lastMonth = {
        start: new Date(today.getFullYear(), today.getMonth() - 1, 1), // starting date
        // today is 4th May, then here we will get 0th may which is 30th of April
        end: new Date(today.getFullYear(), today.getMonth(), 0) // ending date.
    }

    const thisMonthProductsPromise = productModel.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end
        }
    });

    const lastMonthProductsPromise = productModel.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    });

    const thisMonthUserPromise = UserModel.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end
        }
    });

    const lastMonthUserPromise = UserModel.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    });

    const thisMonthOrderPromise = orderModel.find({
        createdAt: {
            $gte: thisMonth.start,
            $lte: thisMonth.end
        }
    });

    const lastMonthOrderPromise = orderModel.find({
        createdAt: {
            $gte: lastMonth.start,
            $lte: lastMonth.end
        }
    });

    // Now the second thing we have to show is last six months revenue and transactions.
    const lastSixMonthsRevenuePromise = orderModel.find({
        createdAt: {
            $gte: lastSixMonths,
            $lte: today
        }
    });

    const lastSixMonthsOrderPromise = orderModel.find({
        createdAt: {
            $gte: lastSixMonths,
            $lte: today
        }
    }).select("createdAt");

    const [
        thisMonthProducts,
        lastMonthProducts,
        thisMonthUsers,
        lastMonthUsers,
        thisMonthOrders,
        lastMonthOrders,
        productsCount,
        usersCount, 
        allOrders,
        lastSixMonthsRevenue,
        lastSixMonthsOrder,
        categories,
        maleCount,
        femaleCount,
        othersCount,
        transactionsCount,
    ] = await Promise.all([
        thisMonthProductsPromise,
        lastMonthProductsPromise,
        thisMonthUserPromise,
        lastMonthUserPromise,
        thisMonthOrderPromise,
        lastMonthOrderPromise,
        productModel.countDocuments(),
        UserModel.countDocuments(),
        orderModel.find({}).select("total"), // we want to find revenue, so we select "total"
        lastSixMonthsRevenuePromise,
        lastSixMonthsOrderPromise,
        productModel.distinct("category"),
        UserModel.countDocuments({
            gender: "Male"
        }),
        UserModel.countDocuments({
            gender: "Female"
        }),
        UserModel.countDocuments({
            gender: "Others"
        }),
        orderModel.find({}).limit(4).select(["discount", "total", "status"]) // latest 4 transactions
    ]);

    const userChangePercentage = calculatePercentage(thisMonthUsers.length, lastMonthUsers.length);

    const productChangePercentage = calculatePercentage(thisMonthProducts.length, lastMonthProducts.length);

    const orderChangePercentage = calculatePercentage(thisMonthOrders.length, lastMonthOrders.length);

    let thisMonthTotal = 0;
    thisMonthOrders.forEach((i) => {
        thisMonthTotal += i.total
    });

    let lastMonthTotal = 0;
    lastMonthOrders.forEach((i) => {
        lastMonthTotal += i.total
    });

    const revenueChangePercentage = calculatePercentage(thisMonthTotal, lastMonthTotal);

    const revenue = allOrders.reduce((total, order) => total + (order.total || 0), 0);

    const lastSixMonthsRevenueArr = createArray({
        length: 6,
        today,
        arr: lastSixMonthsRevenue,
        property: "total"
    });

    const lastSixMonthsOrderArr = createArray({
        length: 6,
        today,
        arr: lastSixMonthsOrder
    });

    // 6:05:07 -> Inventory part
    const categoriesCountPromise = categories.map(category => productModel.countDocuments({
        category
    }));
    const categoriesCount = await Promise.all(categoriesCountPromise);

    let inventory: Record<string, number>[] = [];
    for (let index = 0; index < categories.length; index++) {
        const element = categories[index];
        inventory.push({
            [element]: Math.round((categoriesCount[index] / productsCount) * 100)
        })
    }

    // gender ratio
    const gender = {
        Male: maleCount,
        Female: femaleCount,
        Others: othersCount
    }

    const changePercentage = {
        product: productChangePercentage,
        user: userChangePercentage,
        order: orderChangePercentage,
        revenue: revenueChangePercentage
    }

    const count = {
        product: productsCount,
        users: usersCount,
        order: allOrders.length,
        revenue
    }

    const chart = {
        lastSixMonthsRevenueArr,
        lastSixMonthsOrderArr
    }

    stats = {
        changePercentage,
        count,
        chart,
        inventory,
        gender,
        transactionsCount
    }

    return res.status(200).json({
        success: true,
        stats
    });
}

export const getPieChartData = async(req:Request, res:Response, next:NextFunction) => {
    // finding count of the orders which are deliverd, processing and shipped.
    const processingOrderpromise = orderModel.countDocuments({
        status: "Processing"
    });
    const shippedOrderpromise = orderModel.countDocuments({
        status: "Shipped"
    });
    const deliverdOrderpromise = orderModel.countDocuments({
        status: "Deliverd"
    });

    // finding number of products that are out of stock and which are in stock.
    const outofStockProductsPromise = productModel.countDocuments({
        stock: 0
    });
    const inStockPorductsPromise = productModel.countDocuments({
        stock: {
            $gt: 0
        }
    });

    // number of admin and users
    const adminCountPromise = UserModel.countDocuments({
        role: "Admin"
    });
    const userCountPromise = UserModel.countDocuments({
        role: "User"
    });

    const [
        Processing, 
        Shipped, 
        Deliverd,
        Cancelled,
        outofStockProductsCount,
        inStockPorductsCount,
        admin, 
        customer,
        allUser,
        allOrders
    ] = await Promise.all([
        processingOrderpromise, 
        shippedOrderpromise, 
        deliverdOrderpromise,
        (await deletedOrderModel.find({})).length,
        outofStockProductsPromise,
        inStockPorductsPromise,
        adminCountPromise,
        userCountPromise,
        UserModel.find({}).select("dob"),
        orderModel.find({})
    ]);

    
    /*
        product category ratio

        Now here we will make key value pair.

        const categoryCount = [
            {
                "laptop" : 1
            }
        ]

        We have to make the array just like this. We have the categories array and categoriesCount array.
            
    */
    let categoryCount:Record<string, number>[] = []; 
    const categories = await productModel.distinct("category");
    const categoriesCountPromise = categories.map((category) => productModel.countDocuments({category}));
    const productsCount = await productModel.countDocuments();
    const categoriesCount = await Promise.all(categoriesCountPromise);
    categories.forEach((category, i) => {
        categoryCount.push({
            [category]: Math.round((categoriesCount[i] / productsCount) * 100)
        })
    });
    

    const orderCount = {
        Processing, 
        Shipped, 
        Deliverd,
        Cancelled
    }

    const stock = {
        outofStockProductsCount,
        inStockPorductsCount
    }

    // Revenue distribution
    const grossIncome = allOrders.reduce((acc, order) => acc + order.total, 0);
    const Discount = allOrders.reduce((acc, order) => acc + order.discount, 0);
    const ShippingCost = allOrders.reduce((acc, order) => acc + (order.shippingCharges || 0), 0);
    const Burnt = allOrders.reduce((acc, order) => acc + order.tax, 0);
    const MarketingCost = Math.round(grossIncome * (30 / 100)); // assumed 30%
    const NetMargin = grossIncome - Discount - ShippingCost - Burnt - MarketingCost;
    const revenueDistribution = {
        NetMargin,
        Discount,
        ShippingCost,
        Burnt, // loss of money
        MarketingCost
    }

    const peopleAgeCount = {
        Teen: allUser.filter((i) => i.age < 20).length,
        Adult: allUser.filter((i) => i.age >= 20 && i.age < 40).length,
        Old: allUser.filter((i) => i.age >= 40).length
    }

    const peopleCount = {
        admin,
        customer
    }

    return res.status(200).json({
        success: true,
        pie: {
            orderCount,
            stock,
            categoryCount,
            peopleAgeCount,
            revenueDistribution,
            peopleCount
        }
    });
}

/*

Here we have to show how many total products and users are created in the last 6 and 12 months for order.

*/
export const getBarChartData = async(req:Request, res:Response, next:NextFunction) => {
    const today = new Date();

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6); // we got the date of 6 months ago

    const tewleveMonthsAgo = new Date();
    tewleveMonthsAgo.setMonth(tewleveMonthsAgo.getMonth() - 12); // we will get the date of 12 months ago

    const sixMonthsAgoProductsPromise = productModel.find({
        createdAt: {
            $gte: sixMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const sixMonthsAgoUsersPromise = UserModel.find({
        createdAt: {
            $gte: sixMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const twelveMonthsAgoOrdersPromise = orderModel.find({
        createdAt: {
            $gte: tewleveMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const twelveMonthsAgoCancelledOrdersPromise = deletedOrderModel.find({
        createdAt: {
            $gte: tewleveMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const [
        products, 
        users,
        orders,
        cancelledOrders
    ] = await Promise.all([
        sixMonthsAgoProductsPromise, 
        sixMonthsAgoUsersPromise,
        twelveMonthsAgoOrdersPromise,
        twelveMonthsAgoCancelledOrdersPromise
    ]);

    // now we want an array where against each month we have count of products and users.

    const Products = createArray({
        length: 6,
        today,
        arr: products
    });

    const Users = createArray({
        length: 6,
        today,
        arr: users
    });

    const Orders = createArray({
        length: 12,
        today,
        arr: orders
    });

    const CancelledOrders = createArray({
        length: 12,
        today,
        arr: cancelledOrders
    });

    return res.status(200).json({
        success: true,
        Products,
        Users,
        Orders,
        CancelledOrders
    });
}

export const getLineChartData = async(req:Request, res:Response, next:NextFunction) => {
    const today = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12); // we will get the date of 12 months ago

    const twelveMonthsAgoUsersPromise = UserModel.find({
        createdAt: {
            $gte: twelveMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const twelveMonthsAgoProductsPromise = productModel.find({
        createdAt: {
            $gte: twelveMonthsAgo,
            $lte: today
        }
    }).select("createdAt");

    const twelveMonthsAgoOrdersPromise = orderModel.find({
        createdAt: {
            $gte: twelveMonthsAgo,
            $lte: today
        }
    }).select(["createdAt", "discount", "total"]);

    const [
        users,
        products,
        orders
    ] = await Promise.all([
        twelveMonthsAgoUsersPromise,
        twelveMonthsAgoProductsPromise,
        twelveMonthsAgoOrdersPromise
    ]);

    const Users = createArray({
        length: 12,
        today,
        arr: users
    });

    const Products = createArray({
        length: 12,
        today,
        arr: products
    });

    const Revenue = createArray({
        length: 12,
        today,
        arr: orders,
        property: "total"
    });

    const Discount = createArray({
        length: 12,
        today,
        arr: orders,
        property: "discount"
    });

    return res.status(200).json({
        success: true,
        Users,
        Products,
        Revenue,
        Discount
    });
}