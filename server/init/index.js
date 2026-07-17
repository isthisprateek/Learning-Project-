/* ===========================
      Load Environment
=========================== */

const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../../.env"),
});

/* ===========================
      Module Imports
=========================== */

const mongoose = require("mongoose");

const Listing = require("../models/listing");
const User = require("../models/user");
const Review = require("../models/review");

const initData = require("./data");
const geocodingClient = require("../config/mapbox");

/* ===========================
      Configuration
=========================== */

const mongoUrl =
    process.env.MONGO_URL || "mongodb://127.0.0.1:27017/wanderlust";

/* ===========================
      Database Connection
=========================== */

async function main() {
    await mongoose.connect(mongoUrl);
}

/* ===========================
      Seed Database
=========================== */

const initDb = async () => {

    // Remove previous data
    await Listing.deleteMany({});
    await User.deleteMany({});
    await Review.deleteMany({});

    // Create default admin user
    const user = new User({
        username: "admin",
        email: "admin@example.com",
    });

    const registeredUser = await User.register(
        user,
        "yourPassword"
    );

    // Add geometry to every listing
    for (const listing of initData.data) {

        const response = await geocodingClient
            .forwardGeocode({
                query: `${listing.location}, ${listing.country}`,
                limit: 1,
            })
            .send();

        listing.geometry = response.body.features[0].geometry;
    }

    // Assign owner
    initData.data = initData.data.map((listing) => ({
        ...listing,
        owner: registeredUser._id,
    }));

    // Insert listings
    await Listing.insertMany(initData.data);

    console.log("Database initialized successfully.");
};

/* ===========================
      Run Seeder
=========================== */

main()
    .then(async () => {

        console.log("Connected to Database");

        await initDb();

        mongoose.connection.close();

    })
    .catch((err) => {
        console.error(err);
    });
