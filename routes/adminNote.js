const express = require("express");
const AdminNote = require("../models/AdminNote");
const auth = require("../middleware/auth");

const router = express.Router();


// Get note - customers can read
router.get("/", async (req, res) => {
    try {

        let note = await AdminNote.findOne();

        if (!note) {
            note = await AdminNote.create({
                message: ""
            });
        }

        res.json(note);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});


// Update note - admin only
router.put("/", auth, async (req, res) => {
    try {

        if (req.user.role !== "admin") {
            return res.status(403).json({
                message: "Admin Only"
            });
        }

        let note = await AdminNote.findOne();

        if (!note) {
            note = new AdminNote();
        }

        note.message = req.body.message;

        await note.save();

        res.json({
            message: "Admin Note Updated",
            note
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
});

module.exports = router;