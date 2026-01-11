const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const sessionOptions = {
    secret : "mysupersecretstring" , 
    resave: false, 
    saveUninitialized: true
}

app.use(session(sessionOptions));

app.use(flash());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use((req,res,next) => {
    res.locals.successMsg = req.flash('Success');
    res.locals.errorMsg = req.flash('Error');
    next();
})

app.get("/register", (req,res) => {
    let {name = "Anonymous"}  = req.query;
    req.session.name = name;
    if(name == 'Anonymous') {
        req.flash('Error', 'User not Registered ');
    } else {
        req.flash('Success', 'User Registered Successfully');
    }
    console.log(req.session.name);
    res.redirect('/test');
})

app.get("/test", (req,res) => {
    res.render(`page.ejs`,{name:req.session.name});
});

app.get("/reqcount", (req,res) => {
    if(req.session.count) {
        req.session.count++;
    } else {
        req.session.count = 1;
    }
    res.send(`You sent the request ${req.session.count} times `);
});

app.listen(3000,() => {
    console.log("3000 started");
})