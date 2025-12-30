const mongoose = require("mongoose");

const connectDB = async() => {
    await mongoose.connect("mongodb+srv://kritesh21march_db_user:TdiPxhSbaIfrwoep@namastenode.pj8l1vx.mongodb.net/devtinder");
}

module.exports = connectDB;