const express = require("express");
const Cart = require("../models/Cart");

const router = express.Router();

router.post("/", async (req, res) => {

    try {

        const { userId, productId, quantity } = req.body;

        const existingItem =
        await Cart.findOne({
            userId,
            productId
        });

        if(existingItem)
        {
            existingItem.quantity += quantity;

            await existingItem.save();

            return res.json(existingItem);
        }

        const cart = new Cart({
            userId,
            productId,
            quantity
        });

        await cart.save();

        res.json(cart);

    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.get("/:userId", async (req, res) => {

    const items = await Cart.find({
    userId: req.params.userId
}).populate("productId");

    res.json(items);

});

router.put("/:id", async (req, res) => {

    try {

        const cartItem =
        await Cart.findById(req.params.id);

        cartItem.quantity =
        req.body.quantity;

        await cartItem.save();

        res.json(cartItem);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});

router.delete("/:id", async (req, res) => {

    await Cart.findByIdAndDelete(req.params.id);

    res.json({
        message: "Item Removed"
    });

});

module.exports = router;