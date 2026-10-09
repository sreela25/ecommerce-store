const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const router = express.Router();

router.post("/", async (req, res) => {
    try {

        const Product = require("../models/Product");

        let subtotal = 0;

        // Calculate subtotal
        for (const item of req.body.items) {

            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `${product.name} is out of stock`
                });
            }

            subtotal += product.price * item.quantity;
        }

        // Calculate 5% discount if subtotal is more than ₹200
        let discount = 0;

        if (subtotal > 200) {
            discount = subtotal * 0.05;
        }

        const totalAmount = subtotal - discount;

        // Create order
        const order = new Order({
            userId: req.body.userId,
            items: req.body.items,
            subtotal: subtotal,
            discount: discount,
            totalAmount: totalAmount
        });

        await order.save();

        // Reduce stock
        for (const item of req.body.items) {

            const product = await Product.findById(item.productId);

            product.stock -= item.quantity;

            await product.save();
        }

        // Clear cart
        await Cart.deleteMany({
            userId: req.body.userId
        });

        res.json(order);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

router.get("/:userId", async (req, res) => {
    try {
        const orders = await Order.find({
            userId: req.params.userId
        }).populate("items.productId");

        res.json(orders);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.put("/:id", auth, async (req, res) => {

    try {
if(req.user.role !== "admin")
    {
        return res.status(403).json({
            message:"Admin Only"
        });
    }

    const order =
    await Order.findById(req.params.id);

    order.status =
    req.body.status;

    await order.save();

    res.json(order);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});

router.get("/", async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("items.productId");

        res.json(orders);

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;