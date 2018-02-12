// Initialize Firebase
var config = {
    apiKey: "AIzaSyBIXwuFkVitzP-3jhkHEtcAGK7l3-h4zuk",
    authDomain: "fir-time-3d1bf.firebaseapp.com",
    databaseURL: "https://fir-time-3d1bf.firebaseio.com",
    projectId: "fir-time-3d1bf",
    storageBucket: "fir-time-3d1bf.appspot.com",
    messagingSenderId: "1095060467631"
};
firebase.initializeApp(config);

var database = firebase.database();
var locationRef = database.ref("locations");
var topicRef = database.ref("topics");
var rangeRef = database.ref("range");
var priceRef = database.ref("price");

var map;
var infoWindow;
var locationInput;
var topic;
var range;
var price;
var responseResult;
var longitudeLatitude;

$(document).ready(function() {
   $("#map-space").show();
})


function initMap() {
    // Initialize map to San Francisco
    var sanFrancisco = { lat: 37.773972, lng: -122.431297 };
    map = new google.maps.Map(document.getElementById('map'), {
        center: sanFrancisco,
        zoom: 12,
        mapTypeId: "roadmap"
    });
    infoWindow = new google.maps.InfoWindow;

    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

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
        locationInput = $("#pac-input").val().trim();
        console.log($("#pac-input").val().trim());

        database.ref("search/locations").set({
            locationInput: locationInput
        })
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


function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

//Eventbrite
$(".price").on("click", function() {
    price = $(this).data("value");
    console.log(price);
    $(this).addClass("selected").siblings().removeClass("selected")

    database.ref("search/price").set({
        price: price
    })
})


$(".range").on("click", function() {
    range = $(this).data("value") + "mi";
    console.log(range);
    $(this).addClass("selected").siblings().removeClass("selected")

    database.ref("search/range").set({
        range: range
    })
})


var counter = 0;
var choiceA = "";
var choiceB = "";
var and = "";
$(".thumbnail").on("click", function compare() {
    if (counter === 0 && choiceB !== $(this).data("value")) {
        choiceA = $(this).data("value");
        console.log("helo", this)
        counter++
    } else if (counter === 1 && choiceA !== $(this).data("value")) {
        choiceB = $(this).data("value");
        and = "+";
        counter = 0;
    }
    topic = choiceA + and + choiceB;
    console.log(topic);
    
    database.ref("search/topics").set({
        topic: topic
    })
});


$("#filter-search").on("click", function() {
    event.preventDefault()
    evenbriteSearch(topic, locationInput, range, price);
})


//Requesting info and adding the value of every button to the url
function evenbriteSearch(topic, locationInput, range, price) {
    var queryURL = "https://www.eventbriteapi.com/v3/events/search/?q=" + topic + "&sort_by=date&location.address=" + locationInput + "&location.within=" + range + "&price=" + price + "&token=KJSHU43DGDL7JI6OFUYJ&expand=venue";
    $.ajax({
            url: queryURL,
            method: "GET"
        })
        .then(function(response) {
            console.log(response);
            responseResult = response;
            longitudeLatitude = response.location.latitude +","+response.location.longitude;
            database.ref("search/longitudeLatitude").set({
                longitudeLatitude: longitudeLatitude
            })
            console.log(longitudeLatitude);
            renderResults();
        });
}


function renderResults(response) {
    $(".modal-content").empty();
    for (var i = 0; i < 5; i++) {
        var eventName = $("<h2>");
        eventName.text(responseResult.events[i].name.text);
        
        var eventAddress = $("<h3>");
        eventAddress.text(responseResult.events[i].venue.address.localized_address_display);
        
        var imageHolder= $("<a>");
        imageHolder.attr("href", "foursquare.html");
        imageHolder.attr("onclick", "window.open('"+responseResult.events[i].url+"')");
        
        var eventImage = $("<img>");
        eventImage.attr("src", responseResult.events[i].logo.url);
        imageHolder.append(eventImage);
        
        var eventDescript = $("<p>");
        eventDescript.text("Description: " + responseResult.events[i].description.text);
        $(".modal-content").append(eventName, eventAddress, imageHolder, eventDescript);
        eventDescript.text(function(index, currentText){
            return currentText.substr(0,400)+"...";
        }); 
  }
}

//Foursquare API and append functions
//Call function foursquareSearch() to execute, assing searchTerm and location
function foursquareSearch(food, longitudeLatitude) { // first ajax call
    var queryURL = "https://api.foursquare.com/v2/venues/search";
    $.ajax({
        url: queryURL,
        data: {
            client_id: "UYCPKGBHUK5DSQSOGFBATS2015CFIZM1CELCN4AIYPT1LEBH",
            client_secret: "EBLDOOVW2FIZBGC0PH3M2NATAUCABKHWRVIC3YFRW1SOTKKF",
            ll: longitudeLatitude,
            query: food,
            v: "20180206",
            limit: 3
        },
        cache: false,
        type: "GET",
        success: function(response) {
            console.log(response);
            getImages(response);
            appendFourSquare(response);
        },
        error: function(xhr) {
            console.log(xhr);
        }
    });
};


function getImages(responseObj) { // second ajax call to obtain pictures from the first call
    var counter=0;  // This counter is going to iterate through the results
    for (var i = 0; i < 3; i++) {
        var photoId = responseObj.response.venues[i].id;
        var queryURL = "https://api.foursquare.com/v2/venues/" + photoId + "/photos";
        $.ajax({
            url: queryURL,
            data: {
                client_id: "UYCPKGBHUK5DSQSOGFBATS2015CFIZM1CELCN4AIYPT1LEBH",
                client_secret: "EBLDOOVW2FIZBGC0PH3M2NATAUCABKHWRVIC3YFRW1SOTKKF",
                v: "20180206",
                limit: 1
            },
            cache: false,
            type: "GET",
            success: function(photoResponse) {
                console.log(photoResponse);
                appendImages(photoResponse);
            },
            error: function(xhr) {
                console.log(xhr);
            }
        });

        
        function appendImages(arrOfPhotos){
            console.log(arrOfPhotos)
            var photoPrefix = arrOfPhotos.response.photos.items[0].prefix;
            var photoSize = "400x300";
            var photoSuffix = arrOfPhotos.response.photos.items[0].suffix;
            var photoURL = photoPrefix + photoSize + photoSuffix;
            var fourSquarePhoto = $("<img>");
            fourSquarePhoto.attr("src", photoURL);
            fourSquarePhoto.attr("");
            $("#imgTarget" + counter).append(fourSquarePhoto[0]);
            counter++;
        }
    }

}


function appendFourSquare(responseData) {
    $("#squareTarget").empty();
    for (var i = 0; i < 3; i++) {
        console.log(responseData.response.venues[i].name);
        $("#squareTarget").append("<h2>" + responseData.response.venues[i].name + "</h2>");
        $("#squareTarget").append("<p>" + responseData.response.venues[i].location.address + ", " + responseData.response.venues[i].location.city + "</p>");
        $("#squareTarget").append("<p>" + "Phone: " + responseData.response.venues[i].contact.formattedPhone + "</p>");
        var imgTarget = $("<p>");
        imgTarget.attr("id", ('imgTarget' + i));
        $("#squareTarget").append(imgTarget);
    }
}


$("#food-search").on("click", function() {
    $("#squareTarget").empty();
    database.ref().orderByChild("dateAdded").limitToLast(1).on("child_added", function(snapshot) {

        event.preventDefault()

        console.log(snapshot.val().longitudeLatitude.longitudeLatitude);
        var food= $("#food-input").val().trim();
        var longitudeLatitude = snapshot.val().longitudeLatitude.longitudeLatitude
        console.log(food)
        foursquareSearch(food, longitudeLatitude);

    }, function(errorObsject) {
      console.log("Errors handled: " + errorObject.code);
    });
})