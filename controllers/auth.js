const User = require("../models/user");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const exJwt = require("express-jwt");

exports.signup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  const user = new User(req.body);
  user.save((err, usr) => {
    if (err) {
      return res.status(400).json({ error: "Unable to save user" });
    }
    return res.json({ name: usr.name, email: usr.email, id: usr._id });
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  User.findOne({ email }, (err, usr) => {
    if (err || !usr) {
      return res.status(400).json({ error: "User email does not exists." });
    }

    if (!usr.authenticate(password)) {
      return res.status(401).json({ error: "Email and password do not match" });
    }

    //create token
    const token = jwt.sign({ _id: usr._id }, process.env.SECRET);
    //put token in cookie
    res.cookie("token", token, { expire: new Date() + 9999 });

    //send response to front end
    const { _id, name, email, role } = usr;
    return res.json({ token, user: { _id, name, email, role } });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "user signed out successfully" });
};

//protected routes
exports.isSignedIn = exJwt({
  secret: process.env.SECRET,
  userProperty: "auth",
});

//custom middlewares
exports.isAuthenticated = (req, res, next) => {
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if (!checker) {
    return res.status(403).json({ error: "ACCESS DENIED, You are not authenticated!" });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (req.profile.role === 0) {
    return res
      .status(403)
      .json({ error: "ACCESS DENIED, YOU ARE NOT AN ADMIN" });
  }
  next();
};
