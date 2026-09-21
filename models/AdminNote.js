const mongoose = require("mongoose");

const adminNoteSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("AdminNote", adminNoteSchema);

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