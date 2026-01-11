const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require('passport');
const { saveRedirectUrl } = require('../middleware.js');
const UserController = require("../controller/user.js");

router.route("/signup")
  .get(UserController.renderSignUpForm)
  .post(wrapAsync(UserController.signUp));

router.route("/login")
  .get(UserController.renderLogInForm)
  .post(
  saveRedirectUrl,
  passport.authenticate('local', {
    failureRedirect: '/login', 
    failureFlash: true
  }),
  //passport will automatically reset the req.session
  UserController.LogIn
)

router.get("/logout",UserController.LogOut)

module.exports = router;