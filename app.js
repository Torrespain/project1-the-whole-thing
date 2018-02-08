  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyBEagO1eUpMcdMCAnHawJnZqjRRF29fgd4",
    authDomain: "project-1-65a27.firebaseapp.com",
    databaseURL: "https://project-1-65a27.firebaseio.com",
    projectId: "project-1-65a27",
    storageBucket: "project-1-65a27.appspot.com",
    messagingSenderId: "185964613097"
  };
  firebase.initializeApp(config);

var database = firebase.database();
var locationRef = database.ref("/locations");
var topicRef = database.ref("/topics");
var priceRef = database.ref("/price");

var map;
var infoWindow;
var location;
var topic;
var price;


$("#quick-search").on("click", function() {
    findCurrentLocation();
    $("#map-space").hide();
});

$("#loc-search").on("click", function() {
    $("#map-space").show();
    initMap();
})

$(document).ready(function() {
    $("#map-space").hide();
} )


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}


function findCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            console.log(pos);
            console.log(pos.lat);
            console.log(pos.lng);
            quickSearch(pos.lat, pos.lng);
            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            infoWindow.open(map);
            map.setCenter(pos);
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function initMap() {
    // Initialize map to San Francisco
    var sanFrancisco = { lat: 37.773972, lng: -122.431297 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: sanFrancisco,
        zoom: 12,
        mapTypeId: "roadmap"
    });
    infoWindow = new google.maps.InfoWindow;
    // Find current location and center the map there
    // findCurrentLocation();
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });
    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        if (places.length == 0) {
            return;
        }
        // Clear out the old markers.
        markers.forEach(function(marker) {
            marker.setMap(null);
        });
        markers = [];
        // For each place, get the icon, name and location.
        var bounds = new google.maps.LatLngBounds();
        places.forEach(function(place) {
            if (!place.geometry) {
                console.log("Returned place contains no geometry");
                return;
            }
            var icon = {
                url: place.icon,
                size: new google.maps.Size(71, 71),
                origin: new google.maps.Point(0, 0),
                anchor: new google.maps.Point(17, 34),
                scaledSize: new google.maps.Size(25, 25)
            };
            // Create a marker for each place.
            var marker = new google.maps.Marker({
                map: map,
                icon: icon,
                title: place.name,
                position: place.geometry.location
            });
            markers.push(marker);
            var infowindow = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(getInfoContent(place));
                console.log(place);
                infowindow.open(map, this);
            });
            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });
        map.fitBounds(bounds);
    });
}
function getInfoContent(place) {
    var isOpen;
    if (place.opening_hours.open_now) {
        isOpen = "Open";
    } else {
        isOpen = "Closed";
    }
    var openHours = place.opening_hours.weekday_text;
    return '<div><strong>' + place.name + '</strong><br>' +
        place.formatted_address + '<br>' +
        isOpen + '<br>' +
        openHours + '<br>' +
        "Rating: " + place.rating + '<br>'
    '</div>';
}



//Eventbrite


// This function will be called after pressing Quick Search bttn, it will use latitude and longitude from Maps API
function quickSearch(latitude, longitude){ 

    //https://www.eventbriteapi.com/v3/events/search/?sort_by=date&location.latitude=37.784373&location.longitude=-122.407705&token=KJSHU43DGDL7JI6OFUYJ
    var latitudeLongitude = "https://www.eventbriteapi.com/v3/events/search/?sort_by=date&location.latitude="+latitude+"&location.longitude="+longitude+"&token=KJSHU43DGDL7JI6OFUYJ";
    $.ajax({
    url: latitudeLongitude,
    method: "GET"
  })
  .then(function(response) {
        console.log(response);
    });
}

function evenbriteSearch(){     //Requesting info and adding the value of every button to the url

    var queryURL = "https://www.eventbriteapi.com/v3/events/search/?q="+topic+"&sort_by=date&location.address="+location+"&location.within="+range+"&price="+price+"&token=KJSHU43DGDL7JI6OFUYJ";
    $.ajax({
    url: queryURL,
    method: "GET"
  })
  .then(function(response) {
        console.log(response);
    });
}

var topic="";

$(".topic").on("click",function(){
    topic=$(this).val();
    console.log(topic)

    database.ref("/topics").push({
        topic: topic
    })
})

var range="";

$(".range").on("click",function(){
    range=$(this).val()+"mi";
    console.log(range)

    database.ref("/range").push({
        range: range
    })
})

var price="";

$(".price").on("click",function(){
    price=$(this).val();
    console.log(price)

    database.ref("/price").push({
        price: price
    })
})


