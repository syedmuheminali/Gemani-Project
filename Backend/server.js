require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database");

connectToDB()
    .then(() => {
        console.log("MongoDB connected");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error);
    });

// app.listen(3000,()=>{
//     console.log("Server is Running on Port 3000")
// })


module.exports = app;