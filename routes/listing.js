const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
// const path = require("path");
// const Review = require("../models/review.js");
const ListingController = require("../controller/listing.js");
const multer = require("multer");

const {storage} = require("../cloudconfig.js");

const upload = multer({ storage });
//Index Route   
router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        upload.single('listing[image]'),
        //New Route
        isLoggedIn,
        wrapAsync(ListingController.createListing),
        validateListing,
        // (req,res) => {
        //     console.log(req.body);
        //     res.send(req.file);
        // }
    );

router.get("/new", isLoggedIn, ListingController.renderNewForm);

//Show Route
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(isLoggedIn,isOwner,upload.single('listing[image]'),validateListing, wrapAsync(ListingController.updateListing))
    .delete(isLoggedIn,isOwner, wrapAsync(ListingController.deleteListing))
// console.log("hello");

//Create Route

//Edit request -> request will come then we have to render a form for edit
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(ListingController.renderEditForm));

//Update Request
//here address is that address where request of updation will come and in get method the address is that one where we will be directed to after sending the get request

//Delete Request

module.exports = router;