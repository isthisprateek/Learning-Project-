if(process.env.NODE_ENV != "production") {
    require('dotenv').config();
}
// console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
// const urlMongo = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;
console.log(dbUrl);
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate"); // nav bar  exists on every page of the website.
const ExpressError = require('./utils/ExpressError.js');
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require('passport-local');
const User = require('./models/user.js');

const  listingsRouter  = require("./routes/listing.js");
const reviewsRouter = require('./routes/review.js')
const userRouter = require('./routes/user.js')

async function main() {
    await mongoose.connect(dbUrl);
}

const store = new MongoStore({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on("error", ()=> {
    console.log("Error in MONGO Session Store",err);
})

const sessionOptions = {
    store,
    secret:process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //milliseconds
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //Cross Scripting attacks
    }
};


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(flash());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"public")));
app.use(cookieParser("secretcode"));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.engine('ejs',ejsMate);

app.use((req,res,next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();

})

app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("", userRouter);



main().then(() => {
  console.log("Connected to DB");

}).catch(err => {
    console.log("Connection cannot be established");
})


// app.get("/",(req,res) => {
//     console.dir(req.cookies);
//     res.send("Ram Ram");
// });

app.get('/demouser', async (req,res) => {
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "Delta-Student",
    });
    const registeredUser = await User.register(fakeUser,"helloworld");
    res.send(registeredUser);
})

app.get("/getcookies", (req,res) => {
    res.cookie("greet", "Hola Amigo");
    res.cookie("Great","Prateek");
    res.send("Sent you some cookie");
})

app.get("/greet", (req,res) => {
    let {naam = "Anonymous"} = req.cookies;
    res.send(`Hi ${naam}`);
})
///Cookies are used to store some info in browser which can be used by the diff. pages of the website.
//Signed Cookies 
app.get("/getsignedcookie", (req,res) => {
    res.cookie("made-in","India",{signed:true});
    res.send("Signed Cookie sent");
})

app.get("/verify", (req,res) => {
    console.log(req.signedCookies); // by req.cookies only unsigned cookies will be printed
    res.send("Verified");    // if signedCookie is changed then empty object will be printed
})
// app.get("/testListing",async (req,res) => {
    //     let sampleListing = new Listing({
        //         title: "My New Villa",
        //         description: "By the Beach",
        //         price: 1200,
        //         location: "Calicut",
        //         country : "India",
        //     })
        //     await sampleListing.save();
        //     console.log("Sample was saved");
        //     res.send("Successful Testing");
        // })

app.use((req,res,next) => {

    next(new ExpressError(404,`Page Not Found, ${req.path}`));
});

app.use((err,req,res,next) => {
    let {statusCode = 500, message = "Somehting went Wrong"} = err;
    // res.status(statusCode).send(message + " Jai baba ki");
    res.status(statusCode).render("error.ejs",{err});
    // res.send("Something Went Wrong");
})
app.listen(8080, () => {
    console.log("Started server"); 
});