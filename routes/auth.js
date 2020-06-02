const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');

const { signout,signup, signin, isSignedIn } = require("../controllers/auth");


router.post("/signup",[
    check("name").isLength({ min: 3 }).withMessage("name should be at least 3 chars"),
    check("email").isEmail().withMessage("valid email address is required"),
    check("password").isLength({ min: 4 }).withMessage("password should be at least 4 chars long")
], signup);

router.post("/signin",[
    check("email").isEmail().withMessage("valid email address is required"),
    check("password").isLength({ min: 4 }).withMessage("password field is required")
], signin);


router.get("/signout", signout);

router.get("/test",isSignedIn,(req,res)=>{
    res.send("Hello from protected route")
})

module.exports = router;
