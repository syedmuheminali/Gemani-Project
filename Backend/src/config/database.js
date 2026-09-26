const mongoose = require("mongoose");

const connectToDB = async () => {
    await mongoose.connect(process.env.MONGO_URI);
};

module.exports = connectToDB;