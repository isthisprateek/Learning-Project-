const express = require('express');
const app = express();
const ExpressError = require('./ExpressError');

// app.use((req,res,next)=> {  //middlewares will work even if the path doesn't exists.
//     // let query = req.query.bc;
//     // console.log(req.query)
//     console.log("Hi, I am middleWare");
//     // res.send("Middleware finished");
//     next();
//     console.log("After next of 1st middleware");
// })

// app.use((req,res,next) => {
//     console.log("I am 2nd middleware");
//     return next(); //Now after next nothing will be executed
// })

// app.use((req,res,next) => { //Logger - morgan
//     req.time = new Date(Date.now()).toString();
//     console.log(typeof req.method , req.hostname, req.path , req.time);  //check exxpress js docs
//     next();
// })

// app.use("/random",(req,res,next) => {
//     console.log("Random expp");
//     next();

// })

const checkToken = (req,res,next)=> {
    let {token} = req.query;
    if(token === "giveaccess") {
        next();
    } 
    throw new ExpressError(404,"Access Na mile mittar");
};

app.use("/api", checkToken , (req,res,next) => {
    res.send("Ram nam satya hai");
})
app.get('/err',(req,res) => {
    abcd = abcd;
})

app.get("/admin", (req,res) => {
    throw new ExpressError(403, "Access to admin is Forbidden ")
})

app.use((err,req,res,next) => {   //Custom error handling middlewares.
    console.log("----Error----");
    let {status = 500 , message = "Some error occurred" } = err;
    res.status(status).send(message + " \nJai baba Ki");
    // res.send(err.message);
    // next(err);  //next will search for next non-error handling middlewares.
})
// app.use((err,req,res,next) => {   //Custom error handling middlewares.
//     console.log("----Error2----");

//     next();  //next will search for next non-error handling middlewares.
// })
// app.get('/api',(req,res) => {
//     res.send("Mil gaya");
// })
app.get("/", (req,res) => {
    res.send("Hi , I am root");
})

app.get("/random", (req,res) => {
    res.send("This is a random page");
})

// app.use((req,res) => {
//     res.status(404).send("Page not found");
// })
app.listen(8000,() => {
    console.log("Server started");
})