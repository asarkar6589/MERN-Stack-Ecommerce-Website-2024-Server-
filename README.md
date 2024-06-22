# ECommerce Backend

This repository contains the backend code for the eCommerce website built using the MERN (MongoDB, Express.js, React.js, Node.js) stack.


# Table of Contents

 - Installation
 - Usage
 - API Endpoints
 - Environment Variables
 - Contributing
 - License

## Installation

**Prerequisites**
Make sure you have the following installed on your system:
	

 -  Node.js (v12 or higher)
-   npm (v6 or higher)
-   MongoDB (v4 or higher)

Steps:
 - Clone the Repository: `git clone https://github.com/asarkar6589/MERN-Stack-Ecommerce-Website-2024-Server-.git`
 
 - Install Dependencies : `npm install`
 
 - Set up environment variables : Create a `.env` file in the root of the project and add the following variables : `PORT_NUMBER, MONGO_URL, STRIPE_KEY`
 
 - Start the server by writing these 2 commands in separate terminal : `npm run watch` and `npm run dev`. First one is for running the typescript compiler and second one is for running the 

## Usage

**Running in Development Mode**
		To run the server in development mode with hot reloading, use: `npm run dev`
		
**Running in Production Mode**
		To run the server in production mode, use: `npm start`

## API Endpoints

**The backend API provides the following endpoints:**
	

 - **Authentication**
		 - `POST /api/v1/user/new`: **Register a new user**
		-  	 `POST /api/v1/user/login`: **Login an existing user**
		-   `POST /api/v1/user/logout`: **Logout a user**
		- `GET /api/v1/user/account`: **Details of logged in user**
		- `GET /api/v1/user/all`: **Get details of all the registered users (Admin)**
		- `DELETE /api/v1/user/delete/:id`: **Delete a user (Admin)**
		- `PUT /api/v1/user/:id`: **Update the details of the user**
	
 - **Statistics of Ecommerce (Admin access only)**
		- `GET /api/v1/stats/dashboard`: **Admin Dashboard**
		-  	 `GET /api/v1/stats/pie`: **Pie Charts**
		-   `GET /api/v1/stats/bar`: **Bar Charts**
		- `GET /api/v1/stats/line`: **Line Charts**
		
 -   **Products**
			- `POST /api/v1/product/admin/new`: **Creating new product (Admin Access)**
			-  	 `GET /api/v1/product/admin/allProducts`: **All Products (Admin Access)**
			-   `GET /api/v1/product/latest`: **Latest Products**
			- `GET /api/v1/product/category`: **All Categories**
			- `GET /api/v1/product/brand`: **All Brands**
			- `GET /api/v1/product/all`: **Search Products**
			- `GET /api/v1/product/:id`: **Details of a single product (Admin Access)**
			- `PUT /api/v1/product/:id`: **Update Product (Admin Access)**
			- `DELETE /api/v1/product/:id`: **Delete Product (Admin Access)**

 -   **Payment**
			- `POST /api/v1/pay/new`: **New Payment**

 -   **Order**
			- `POST /api/v1/order/new`: **New Order**
			- `GET /api/v1/order/all`: **All Orders of a particular user**
			- `GET /api/v1/order/admin/all`: **All the orders (Admin Access)**
			- `PUT /api/v1/order/admin/update/:id`: **Update status of order (Admin Access)**
			- `DELETE /api/v1/order/delete/:id`: **Deleting order by user**
			- `GET /api/v1/order/admin/:id`: **Get order by admin (Admin Access)**
			- `GET /api/v1/order/:id`: **Get details of order by the user who placed the order**

 -   **Feedback**
			- `POST /api/v1/feedback/new`: **New Feedback by the user**

 -   **Deleted Orders**
			- `GET /api/v1/order/cancelled/all`: **All cancelled orders (Admin Access)**
			-  `PUT /api/v1/order/cancelled/:id`: **Update cancelled order (Admin Access)**
			-  `GET /api/v1/order/cancelled/:id`: **Get details of cancelled order (Admin Access)**

-   **Coupon**
			- `POST /api/v1/coupon/new`: **Creating new coupon (Admin Access)**
			-  `GET /api/v1/coupon/all`: **Get all coupons (Admin Access)**
			-  `GET /api/v1/coupon/check/:name`: **Check weather the given coupon is valid**
			- `GET /api/v1/coupon/:id`: **Coupon Information (Admin Access)**
			- `DELETE /api/v1/coupon/:id`: **Delete Coupon (Admin Access)**
			- `PUT /api/v1/coupon/:id`: **Update Coupon (Admin Access)**

-   **Comments**
			- `POST /api/v1/comment/new`: **Creating new comment for a product**
			-  `GET /api/v1/comment/delete`: **Deleting comment for a product**
			-  `GET /api/v1/comment/all`: **Get All the comments for a particular product**
			- `PUT /api/v1/comment/:id`: **Update comment**
			- `GET /api/v1/comment/:id`: **To get the information about a particular comment**


## Environment Variables

The following environment variables need to be set in your `.env` file:

 - PORT_NUMBER: `5000 or any`
 - MONGO_URL: `mongodb://localhost:27071 or cloud uri`
 - STRIPE_KEY: `stripe secret key`

# Contributing

Contributions are welcome! Please follow these steps:

 - Fork the repository
-   Create a new branch (`git checkout -b feature/your-feature`)
-   Make your changes
-   Commit your changes (`git commit -m 'Add some feature'`)
-   Push to the branch (`git push origin feature/your-feature`)
-   Open a pull request

## Author

 - **[Instagram](https://www.instagram.com/sarkararnab266/)**
 - **[Linkedln](https://www.linkedin.com/in/arnab-sarkar-676813202/)**
 - **[Facebook](https://www.facebook.com/profile.php?id=100059726717883)**
 - **[Twitter](https://x.com/ArnabSa22710292)**
 - **[Portfolio](https://arnab-portfolio-nu.vercel.app/)**
 - **[Github](https://github.com/asarkar6589)**
 - **[LeetCode](https://leetcode.com/u/sarkararnab266/)**
 - **[GeeksForGeeks](https://auth.geeksforgeeks.org/user/sarkararnab266/practice)**
