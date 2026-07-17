const express = require('express');
const router = express.Router({mergeParams:true});
const multer = require("multer");

const wrapAsync = require('../utils/wrapAsync.js');
const {isLoggedIn, isOwner, validateListing, saveRedirectUrl} = require("../middleware.js");
const ListingController = require("../controller/listing.js");
const {storage} = require("../config/cloudconfig.js");
const upload = multer({ storage });


/*
    Get all the Listings
    Create a Listing...
*/
router.route("/")
    .get(wrapAsync(ListingController.index))
    .post(
        isLoggedIn,
        upload.single("listing[image]"),
        validateListing,
        wrapAsync(ListingController.createListing),
    );

/*
    Create a new Listing
*/
router.route("/new")
    .get(
        isLoggedIn,
        saveRedirectUrl, 
        ListingController.renderNewForm
    );

router.route("/search")
    .get(
        wrapAsync(ListingController.searchListing)
    );


/*
    Show a specific Listing
    Edit a listing
    Delete a listing
*/
router.route("/:id")
    .get(wrapAsync(ListingController.showListing))
    .put(
        isLoggedIn,
        isOwner,
        upload.single("listing[image]"),
        validateListing, 
        wrapAsync(ListingController.updateListing)
    )
    .delete(
        isLoggedIn,
        isOwner, 
        wrapAsync(ListingController.deleteListing)
    );


/*
    Get the edit form
*/
router.route("/:id/edit")
    .get(isLoggedIn,
        isOwner, 
        wrapAsync(ListingController.renderEditForm)
    );


module.exports = router;