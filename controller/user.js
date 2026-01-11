const User = require('../models/user');

module.exports.signUp = async(req,res) => {
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
      return res.redirect("/listings");
    })
    // console.log(regUser);
    // res.redirect("/listings");
  } catch(err) {
    console.log(err);
    req.flash("error",err.message);
    res.redirect("/signup");
  }
}

module.exports.renderSignUpForm = (req,res) => {
  res.render("users/signup.ejs");
};

module.exports.renderLogInForm = (req,res) => {
  res.render("users/login.ejs");
};

module.exports.LogIn =   async(req,res) => {
    req.flash("success"," Welcome to WanderLust, you are Logged in. ");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
  };

module.exports.LogOut = 
(req,res,next) => {
  req.logout((err)=> {
    if(err) {
      next(err);
    };
    req.flash("success","You are logged out Successfully");
    res.redirect("/listings");
  })
}