const express = require('express');
const router = express.Router({mergeParams:true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { reviewSchema } = require("../schema.js");
const reviews = require('../routes/review.js');
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");

const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const ReviewController = require("../controller/review.js");

//Reviews [POST]
router.post("/", validateReview ,isLoggedIn, wrapAsync(ReviewController.createReview));

//Delete Review Route
router.delete("/:reviewId",isLoggedIn, isReviewAuthor, wrapAsync(ReviewController.destroyReview));

module.exports = router;