const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env"),
});

const mapToken = process.env.MAP_TOKEN;

const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports = geocodingClient;