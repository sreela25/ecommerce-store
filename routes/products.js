const express = require("express");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

const router = express.Router();

router.post("/",auth, async (req, res) => {

    try {


        const {
    name,
    description,
    price,
    category,
    stock,
    image
} = req.body;

if(
    !name ||
    !description ||
    !price ||
    !category ||
    !stock ||
    !image
)
{
    return res.status(400).json({
        message:
        "All fields are required"
    });
}

        const product = new Product(req.body);

        await product.save();

        res.json(product);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

router.get("/", async (req, res) => {

    const products = await Product.find();

    res.json(products);

});

router.put("/:id", async (req, res) => {

    try {

        const product =
        await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { returnDocument: "after" }
        );

        res.json(product);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});

router.put("/rating/:id", async (req, res) => {

    try {

        const product =
        await Product.findById(req.params.id);

        product.rating =
        req.body.rating;

        await product.save();

        res.json(product);

    } catch(error) {

        res.status(500).json({
            message:error.message
        });

    }

});

router.delete("/:id", async (req, res) => {

    try {

        await Product.findByIdAndDelete(
            req.params.id
        );

        res.json({
            message: "Product Deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;