const express = require("express");
const Order = require("../models/Order");
const auth = require("../middleware/auth");
const Cart = require("../models/Cart");
const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const order = new Order(req.body);

        await order.save();

        const Product = require("../models/Product");

for(const item of req.body.items)
{
    const product =
    await Product.findById(
        item.productId
    );

    if(product.stock < item.quantity)
{
    return res.status(400).json({
        message: `${product.name} is out of stock`
    });
}

product.stock -= item.quantity;

await product.save();
}
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

    const orders = await Order.find({
        userId: req.params.userId
    });

    res.json(orders);

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

        const orders =
        await Order.find();

        res.json(orders);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});

module.exports = router;