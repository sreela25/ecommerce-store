const mongoose = require("mongoose");

const adminNoteSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("AdminNote", adminNoteSchema);