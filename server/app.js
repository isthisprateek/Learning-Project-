/* ===========================
        Core Modules
=========================== */

const path = require("path");

// Load environment variables in development only
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config({
        path: path.join(__dirname,"../.env" )
    });
}



/* ===========================
      Third Party Modules
=========================== */

const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

/* ===========================
       Project Modules
=========================== */

const ExpressError = require("./utils/ExpressError");

const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

const listingsRouter = require("./routes/listing");
const reviewsRouter = require("./routes/review");
const userRouter = require("./routes/user");

/* ===========================
      App Configuration
=========================== */

const app = express();

const dbUrl =
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

const PORT = process.env.PORT || 8080;

/* ===========================
     MongoDB Connection
=========================== */

async function main() {
    await mongoose.connect(dbUrl);
}

main()
    .then(() => console.log("Connected to Database"))
    .catch((err) => console.log("Database Connection Error:", err));

/* ===========================
      Session Store
=========================== */

// Store user sessions in MongoDB Atlas instead of server memory
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600, // Update session only once every 24 hours if unchanged
});

store.on("error", (err) => {
    console.log("Mongo Session Store Error:", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, // Prevent client-side JavaScript from accessing cookies
    },
};

/* ===========================
        View Engine
=========================== */

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client/views"));
app.engine("ejs", ejsMate);

/* ===========================
        Middlewares
=========================== */

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "../client/public")));

app.use(cookieParser(process.env.SECRET));
app.use(session(sessionOptions));

app.use(flash());

/* ===========================
      Passport Configuration
=========================== */

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* ===========================
   Global Template Variables
=========================== */

// Variables available in every EJS template
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    res.locals.redirectUrl = "/";
    res.locals.query = "";
    next();
});

/* ===========================
           Routes
=========================== */

// More specific routes should always come before general routes
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/listings", listingsRouter);
app.use("/", userRouter);

/* ===========================
       404 Handler
=========================== */

app.use((req, res, next) => {
    next(new ExpressError(404, `Page Not Found: ${req.path}`));
});

/* ===========================
    Global Error Handler
=========================== */

app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong",
    } = err;

    res.status(statusCode).render("error.ejs", { err });
});

/* ===========================
        Start Server
=========================== */

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// console.log(MongoStore);