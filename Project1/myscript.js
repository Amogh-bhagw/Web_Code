var infowindow2;
var marker2;
var service;
var map;
let markers = [];
var querySearch = false;

/*I used code from the Google API website in my functions with a few modifications
* I also copied Dr.Dan's code from lecture for geocoding
*/
function initMap() {
    var myOptions = {
        zoom: 14,
        center: new google.maps.LatLng(44.9727, -93.23540000000003),
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    var geocoder = new google.maps.Geocoder(); // Create a geocoder object
    geocodeAddress(geocoder, map);  // Puts markers on map
    var loc = new google.maps.LatLng(44.9727, -93.23540000000003);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

          document.getElementById("search").onclick = function() {
            map.setCenter(loc);
            directionsRenderer.setMap(null);
            deleteMarkers();
            findPlace(map,loc);
            
          };
    
            var directionsService = new google.maps.DirectionsService();
            var directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(map);
            directionsRenderer.setPanel(document.getElementById('directionsPanel'));
        
        document.getElementById("go").onclick = function() {
          map.setCenter(loc);
          directionsRenderer.setMap(map);
          deleteMarkers();
          calculateAndDisplayRoute(directionsService, directionsRenderer,loc);
          changeStyle();
        };

      });
    } else {
        window.alert("Error: the Geolocation service has failed");
    }

}

// direction function to help map directions
function calculateAndDisplayRoute(directionsService, directionsRenderer, loc) {
    const selectedMode = document.getElementById("mode").value;
    
    directionsService.route(
      {
        origin: loc, 
        destination: document.getElementById("directionVal").value,
        travelMode: google.maps.TravelMode[selectedMode],
      },
      (response, status) => {
        if (status === "OK") {
          directionsRenderer.setDirections(response);
        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

// finds places depending on text or category
function findPlace(map, loc) {
    service = new google.maps.places.PlacesService(map);
    if(querySearch){
        var toGO = document.getElementById("otherSearch").value;
        var request = {
            location: loc,
            radius: document.getElementById("radius").value,
            query: toGO
        };

        service.textSearch(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              for (var i = 0; i < results.length; i++) {
                var place = results[i];
                createMarker(results[i]);
              }
            }
          });
          querySearch = false;
          document.getElementById('otherSearch').disabled = true;
    } else {
        var typ = document.getElementById("place").value;
        var request = {
            location: loc, 
            radius: document.getElementById("radius").value,
            type: [typ]
        };
        service.nearbySearch(request, function(results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    var place = results[i];
                    createMarker(results[i]);
                }
            }
        });
        
    }
}

// makes the direction panel to show up
function changeStyle(){
  document.getElementById("directionsPanel").style.float = "left";
  document.getElementById("directionsPanel").style.width = "24%";
  document.getElementById("directionsPanel").style.height = "400px";
  document.getElementById("directionsPanel").style.overflowY = "scroll";
}

function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}
// Helps enable other search field
function getPlace() {
    if(document.getElementById("other").selected == true) {
        document.getElementById('otherSearch').disabled = false;
        querySearch = true;
      } 
}

// Puts markers for contacts table
function geocodeAddress(geocoder, resultsMap) {
    var addresses = document.getElementsByClassName('address');
    var names = document.getElementsByClassName('name');
    var address = addresses[1].innerHTML;

    for (var i = 0; i < addresses.length; i++) {
        (function(i) {
            const address = addresses[i];
            const name = names[i];
            geocoder.geocode({'address': address.innerHTML}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                            resultsMap.setCenter(results[0].geometry.location);
                            marker2 = new google.maps.Marker({
                                        map: resultsMap,
                                        position: results[0].geometry.location,
                                        title:address
                                        });
                                        markers.push(marker2);
                            infowindow2 = new google.maps.InfoWindow({
                                        content: name.innerHTML + "<br>" + address.innerHTML
                                        });

                            google.maps.event.addListener(marker2, 'click', createWindow(resultsMap,infowindow2, marker2));
                    } else {
                            alert('Geocode was not successful for the following reason: ' + status);
                    } //end if-then-else
                }); // end call to geocoder.geocode function
        })(i);
    }
} // end geocodeAddress function

// Function to return an anonymous function that will be called when the rmarker created in the 
// geocodeAddress function is clicked	
function createWindow(rmap, rinfowindow, rmarker){
          return function(){
            rinfowindow.open(rmap, rmarker);
        }
}//end create (info) window


function createMarker(place) {
    var marker = new google.maps.Marker({
      map: map,
      position: place.geometry.location
    });
    markers.push(marker);
    var infowindow = new google.maps.InfoWindow;
    google.maps.event.addListener(marker, 'click', function() {
      var request = {
        placeId: place.place_id,
        fields: ['name', 'formatted_address', 'website']
      };
      var service = new google.maps.places.PlacesService(map);
      service.getDetails(request, function(details, status) {
        infowindow.setContent(
          "<strong>" + place.name + "</strong> <br>" + details.formatted_address + "<br>" + details.website)
        infowindow.open(map, marker);
      });
    });
}





// Below is not related to maps

function showBigPic() {
    var num = Math.floor(Math.random() * 5);
    bigpic = document.getElementById("big");
    //document.getElementById("big").style.transform = "rotate(0deg)";
    if (num == 0) {
        bigpic.src = "images/walter.jpg";
        bigpic.alt = "Walter";
    } else if (num == 1) {
        bigpic.src = "images/morrill_140522_2592.jpg";
        bigpic.alt = "Morrill";
    } else if (num == 2) {
        bigpic.src = "images/Shepherd.jpg";
        bigpic.alt = "Shepherd lab";
    } else if (num == 3){
        bigpic.src = "images/keller.jpg";
        bigpic.alt = "Keller";
    } else {
        bigpic.src = "images/coffman.jpg";
        bigpic.alt = "Coffman";

    }
}
var intID;
var rot = 0;
var click = 0;
function dizzy() {
    document.getElementById("big").style.transform = "rotate(" + rot + "deg)";
    rot +=20;
    if(rot == 360) { rot = 0;}
}

function start() {
    if (click == 0){
        click = 1;
        intID = setInterval(function(){dizzy()},100);
    } else {
        click = 0;
        intID=clearInterval(intID);
    } 
}

function checkStrength(){
    var strength = 0;
    var password = document.getElementById("Password").value;

    if (password.length <= 6) {
        document.getElementById("Hold").innerHTML = "Too Short";
        document.getElementById("Hold").style.color = "black";
    } 
        else {
            strength +=1;
        

            if (password.length > 7) {
                strength +=1;
            }

            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/)) {
                strength +=1;

            }

            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/)) {
                strength += 1

            }

            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/)) {
                strength += 1;

            }

            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/)) {
                strength += 1
            }


            if (strength < 2) {
                document.getElementById("Hold").innerHTML = "Weak";
                document.getElementById("Hold").style.color = "red";
            }   else if (strength == 2) {
                    document.getElementById("Hold").innerHTML = "Good";
                    document.getElementById("Hold").style.color = "yellow";
                } else {
                        document.getElementById("Hold").innerHTML = "Strong";
                        document.getElementById("Hold").style.color = "green";
                    }
        }
}