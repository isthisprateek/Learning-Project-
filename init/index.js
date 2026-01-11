const mongoose = require("mongoose");
const initData = require("./data.js");
const  Listing  = require("../models/listing.js");
const { init } = require("../models/user.js");

const mongoUrl = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(mongoUrl);
}

main()
    .then(() => {
        console.log("Connected to DB");
    }) 
    .catch((err) => {
        console.log(err);
    })

// const initDb = async () => {
//     await Listing.deleteMany({});
//     initData.data = initData.data.map((obj) => ({...obj, owner: '6957a3f69901068825a10a3e'}));
//     await Listing.insertMany(initData.data);
//     console.log("Data was initialised");
// }

// initDb();