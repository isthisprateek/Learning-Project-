const Listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req,res ) => {
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
};

module.exports.renderNewForm = (req,res) => {
    // console.log(req.user);
    res.render("listings/new");
}

module.exports.showListing = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    else{
        console.log(listing);
        res.render("listings/show",{listing});
    }
};

module.exports.createListing = async(req,res,next) => {
        // if(!req.body.listing) {
        //     throw new ExpressError(400, "Send Valid Data for listing");
        // }

        let response = await geocodingClient.forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
            })
            .send();
            let listing = req.body.listing;  //JS Object
            let newListing = new Listing(listing);
            if(req.file !== undefined) {
                let url = req.file.path;
                let filename = req.file.filename;
                console.log(url, "..",filename);
                newListing.image = {url,filename};
        }
        newListing.geometry = response.body.features[0].geometry
        // // if(!newListing.title) {
        // //     throw new ExpressError(400,"Title is missing");
        // // }
        // // if(!newListing.description) {
        // //     throw new ExpressError(400,"Title is missing");
        // // }
        // // if(!newListing.location) {
        // //     throw new ExpressError(400,"Title is missing");
        // // }
        newListing.owner = req.user._id;
        // // console.log(req.user);
        let savedListing = await newListing.save();
        // console.log(savedListing);
        req.flash("success", "New Listing Created");
        res.redirect("listings");
    }

module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    let origImage = listing.image.url;
    origImage = origImage.replace("/upload","/upload/h_50,w_100");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    }
    else   res.render("listings/edit",{listing,origImage});
};

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(req.file !== undefined)  {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing = async (req,res) => {
    let {id} = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    console.log(deleted);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}