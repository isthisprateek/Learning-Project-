mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: "mapbox://styles/mapbox/dark-v11",
    center: listing.geometry.coordinates,
    zoom: 10
});

// Listing marker (your existing code, unchanged)
const marker1 = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .addTo(map)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<h4>${listing.location}</h4><p>Exact Location Provided after booking!</p>`))
    .addTo(map);

// --- New: get user location, then draw route ---

function showRouteFromUser() {
    if (!navigator.geolocation) {
        console.warn("Geolocation not supported by this browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const userCoords = [position.coords.longitude, position.coords.latitude];
            const destCoords = listing.geometry.coordinates;

            // Marker for the user's current location
            new mapboxgl.Marker({ color: "blue" })
                .setLngLat(userCoords)
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`<p>Your Location</p>`))
                .addTo(map);

            // Fetch the route from Mapbox Directions API
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${userCoords[0]},${userCoords[1]};${destCoords[0]},${destCoords[1]}?geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: "GET" }
            );

            const json = await query.json();

            if (!json.routes || json.routes.length === 0) {
                console.warn("No route found.");
                return;
            }

            const route = json.routes[0].geometry.coordinates;
            const routeGeoJSON = {
                type: "Feature",
                properties: {},
                geometry: {
                    type: "LineString",
                    coordinates: route
                }
            };

            // Add or update the route source/layer
            if (map.getSource("route")) {
                map.getSource("route").setData(routeGeoJSON);
            } else {
                map.addSource("route", {
                    type: "geojson",
                    data: routeGeoJSON
                });

                map.addLayer({
                    id: "route",
                    type: "line",
                    source: "route",
                    layout: {
                        "line-join": "round",
                        "line-cap": "round"
                    },
                    paint: {
                        "line-color": "#3b82f6",
                        "line-width": 5,
                        "line-opacity": 0.85
                    }
                });
            }

            // Fit the map to show both the user and the listing
            const bounds = new mapboxgl.LngLatBounds();
            bounds.extend(userCoords);
            bounds.extend(destCoords);
            map.fitBounds(bounds, { padding: 60 });
        },
        (error) => {
            console.warn("Could not get user location:", error.message);
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}
document.getElementById("show-route-btn").addEventListener("click", showRouteFromUser);
// showRouteFromUser();