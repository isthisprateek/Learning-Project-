const Listing = require("../models/listing");
const geocodingClient = require("../config/mapbox");

module.exports.index = async (req,res ) => {
    const allListings = await Listing.find({});
    res.render("listings/index",{allListings});
};

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
    } else {
        res.locals.redirectUrl = `/listings/${id}`;
        res.render("listings/show",{listing});
    }
};

module.exports.searchListing = async(req,res) => {
    const {q} = req.query;
    if(!q || q.trim() === "") {
        req.flash("error","Please enter a search term");
        return res.redirect("/listings");
    }

    const searchResults = await Listing.find({
        $or: [
            {title: {$regex: q, $options: "i"}},
            {location: {$regex: q, $options: "i"}},
            {country: {$regex: q, $options: "i"}}
        ],
    });
    res.render("listings/index", {allListings : searchResults, query : q});
}

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new");
}


module.exports.renderEditForm = async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    let origImage = listing.image.url;
    origImage = origImage.replace("/upload","/upload/h_500,w_500");
    if(!listing){
        req.flash("error","Listing you requested for does not exist");
        res.redirect("/listings");
    } else   res.render("listings/edit",{listing,origImage});
};

module.exports.createListing = async(req,res,next) => {
    console.log("Hi entered the callback");
    let listing = req.body.listing;  // JS Object
    console.log(listing);
    let response = await geocodingClient.forwardGeocode({
        query: `${listing.location}, ${listing.country}`,
        limit: 1,
        })
        .send();
    let newListing = new Listing(listing);
    newListing.geometry = response.body.features[0].geometry;
    newListing.geometry.type = 'Point';
    if(req.file !== undefined) {
        let url = req.file.path;
        let filename = req.file.filename;
        newListing.image = {url,filename};
    }
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
}

module.exports.updateListing = async (req,res) => {
    let {id} = req.params;
    let updatedListing = req.body.listing;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
    let response = await geocodingClient.forwardGeocode({
        query: `${updatedListing.location}, ${updatedListing.country}`,
        limit: 1,
        })
        .send();
    listing.geometry = response.body.features[0].geometry;
    listing.geometry.type = 'Point';        
    if(req.file !== undefined)  {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
    }
    
    await listing.save();
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