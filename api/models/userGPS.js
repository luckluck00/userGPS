const mongoose = require("mongoose");

const userGPSSchema = new mongoose.Schema({

    latitude: {
        type: Number,
    },

    longitude: {
        type: Number,
    },

    email: {
        type:String,
    },

    createdAt: {
        type: Date,
        immutable: true,
        default: () => Date.now(),
    },

    updateAt:  {
        type: Date,
        default: () => Date.now(),
    },

});

module.exports = mongoose.model("userGPS" , userGPSSchema);