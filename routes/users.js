const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../model/User");
const auth = require("../middleware/auth");

const bcrypt = require("bcrypt");

//signup user route
router.post("/signup", async (req, res) => {
  try {
    // user input and convert to lowercase
    const { firstName, lastName, email, password } = req.body;

    // validate user has entered something
    if (!(firstName && lastName && email && password)) {
      throw "inputError";
    }

    //validate if existing user
    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
      throw "userexists";
    }

    //encrypt the input password
    const hashPassword = await bcrypt.hash(password, 10);

    //create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashPassword,
    });

    //send message user was created
    return res.status(201).json({
      newUser,
      status: 201,
      message: "User was created successfully",
      requestedAt: new Date().toLocaleString(),
    });
  } catch (error) {
    //error
    console.log(error);

    //user already exists error
    if (error === "userexists") {
      return res.status(409).json({
        status: 409,
        message: error,
        requestAt: new Date().toLocaleString(),
      });
    }

    //input error
    if (error === "inputError") {
      return res.status(400).json({
        status: 400,
        message: "Please enter all required fields",
        requestAt: new Date().toLocaleString(),
      });
    }
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    //get user input
    const { email, password } = req.body;

    //validate user input
    if (!(email && password)) {
      throw "inputError";
    }

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      // Create token
      const token = jwt.sign(
        { _id: user._id, email: user.email },
        process.env.JWTPRIVATEKEY,
        { expiresIn: "1d" }
      );

      // save user token
      user.token = token;

      res.status(200).json(user);
    } else {
      res.status(400).send("Invalid Credentials");
    }
  } catch (error) {
    console.log(error);

    //input error
    if (error === "inputError") {
      return res.status(400).json({
        status: 400,
        message: "Invalid Credentials",
        requestAt: new Date().toLocaleString(),
      });
    }
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

router.post("/homepage", auth, (req, res) => {
  res.status(200).send(`Welcome`);
});

// get user data
router.get("/:id", auth, async (req, res) => {
  console.log("hit get by id");
  try {
    const user = await User.findById(req.params.id).select("-password -__v");
    res.status(200).send({ data: user });
  } catch (error) {
    console.log(error);

    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

//update user data
router.put("/:id", auth, async (req, res) => {
  console.log(req.headers);
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select("-password -__v");
    user.token = req.headers.authorization;
    res.status(200).send({ data: user, message: "User has been updated" });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

// delete user by id
router.delete("/:id", [auth], async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send({ message: "User has been Deleted" });
  } catch (error) {
    console.log(error);
    // all other errors
    return res.status(500).json({
      status: 500,
      message: "Server error",
      requestAt: new Date().toLocaleString(),
    });
  }
});

module.exports = router;
