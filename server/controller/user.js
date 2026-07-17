const User = require('../models/user');

module.exports.renderHomePage = (req,res) => {
  res.render("home.ejs");
}

module.exports.renderSignUpForm = (req,res) => {
  res.render("users/signup.ejs");
};

module.exports.renderLogInForm = (req,res) => {
  res.render("users/login.ejs");
};

module.exports.signUp = async (req,res,next) => {
  try {
    let {username , email , password} = req.body;
    const newUser = new User({email,username});
    const regUser = await User.register(newUser,password);
    req.login(regUser, (err) => {
      if(err) {
        return next(err);
      }
      //when the logIn operation completes, user will be assigned to req.user.
      req.flash("success","Welcome to WanderLust");
      let last_url = res.locals.redirectUrl || "/listings";
      return res.redirect(last_url);
    })
  } catch(err) {
    req.flash("error",err.message);
    res.redirect("/signup");
  }
}

module.exports.LogIn =  async(req,res) => {
    req.flash("success"," Welcome to WanderLust, you are Logged in. ");
    let last_url = res.locals.redirectUrl !== '/' ? res.locals.redirectUrl :  "/listings";
    res.redirect(last_url);
  };

module.exports.LogOut = 
(req,res,next) => {
  req.logout((err)=> {
    if(err) {
      next(err);
    };
    req.flash("success","You are logged out Successfully");
    res.redirect("/");
  })
}