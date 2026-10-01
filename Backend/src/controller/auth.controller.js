const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlackListModel = require("../models/blacklist.model");

// REGISTER
async function RegisterUser(req, res) {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All field are required" });
  }

  const isUserAlreadyRegister = await userModel.findOne({
    $or: [{ username }, { email }],
  });

  if (isUserAlreadyRegister) {
    return res.status(400).json({
      message: "Account already exists with this email address or username",
    });
  }

  const hash = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    username,
    email,
    password: hash,
  });

  const token = jwt.sign(
    { id: user?._id, username: user?.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
});

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user?._id,
      username: user?.username,
      email: user?.email,
    },
  });
}

// LOGIN

async function LoginUser(req, res) {
  const { email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign(
    { id: user?._id, username: user?.username },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
});

  res.status(201).json({
    message: "User login successfully",
    user: {
      id: user?._id,
      username: user?.username,
      email: user?.email,
    },
  });
}

// LOGOUT

async function Logout(req, res) {
  const token = req.cookies.token;

  if (token) {
    await tokenBlackListModel.create({ token });
  }

  res.clearCookie("token");

  res.status(200).json({
    message: "User Logout Successfully",
  });
}

// get me

async function getMe(req, res) {
  const user = await userModel.findById(req.user.id);

  res.status(200).json({
    message: "User details Fetch Successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
}

module.exports = { RegisterUser, LoginUser, Logout, getMe };
