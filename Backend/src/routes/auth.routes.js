const express = require("express");
const { RegisterUser,LoginUser, Logout, getMe } = require("../controller/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

const authRouter = express.Router()

authRouter.post("/register",RegisterUser);
authRouter.post("/login",LoginUser);
authRouter.get("/logout",Logout);
authRouter.get("/get-me", authMiddleware.authUser, getMe);

module.exports = authRouter