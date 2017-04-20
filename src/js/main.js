var Clarifai = require('clarifai');

var cstmMarker = "src/img/marker.png";

// Expiring access token => replace if unauthorized
var authToken = 'v^1.1#i^1#f^0#r^0#I^3#p^1#t^H4sIAAAAAAAAAOVXb2wURRTvtXdtKhSDKBBC5Fg0Rsjezf67Pwt3etCWVgstXNvgIcLc7izddm933ZlLW9T0UoSIGiRBAomJNgYVASMYJSBoAxqjiIlS+WKiJH4QokiIUUyIinPbo1yrAYTTkHhfLvPmzZvf7/fem50Bucrq2esb1v9a46kqH8iBXLnHw40D1ZW+ORMqyqf5ykCRg2cgd1fO219xeh6GGcOWlyJsWyZG/p6MYWLZNcaYrGPKFsQ6lk2YQVgmipxMLGqS+QCQbccilmIZjL+xNsaIaYGPRAQpCnhR1KLUaF4K2WrFGEWLamJIk4AKhEgEanQe4yxqNDGBJokxPODCLBBZHrTynCxJMscFBF5MMf525GDdMqlLADBxF63srnWKoF4ZKcQYOYQGYeKNifpkc6Kxtm5x67xgUax4QYYkgSSLR48WWCryt0Mji668DXa95WRWURDGTDA+vMPooHLiEpjrgO8qHUVQ5TQJ8RKAWlqFJZGy3nIykFwZR96iq6zmusrIJDrpvZqiVI10J1JIYbSYhmis9ef/lmShoWs6cmJM3fzEQ4mWFibeADE0m9dAtsXRFcpIZVuW1rIIRDmREyIcm1ZD4agIpcJGw9EKMo/ZaYFlqnpeNOxfbJH5iKJGY7URi7ShTs1ms5PQSB5RsZ9wSUMOpPJJHc5ilnSY+byiDBXC7w6vnoGR1YQ4ejpL0EiEsROuRDEG2rauMmMn3VoslE8PjjEdhNhyMNjd3R3oFgKWszrIA8AFly1qSiodKEMrhPrme93116++gNVdKgqiK7Euk16bYumhtUoBmKuZOC9y0ZBQ0H00rPhY618MRZyDozuiVB0SToc5CUmKEoYaDEulaJB4oUaDeRgoDXvZDHS6ELENqCBWoWWWzSBHV2VB0nghoiFWDUU1VoxqGpuW1BDLaQgBhNJpJRr5P/XJtVb6AkOnk6200kpT7qUq9QYLE6Rea6n/LbWkYtmoxTJ0pfc/4pbv9WvkJzhqC3RIbxIZBjXcEFHFzeHKUp1YJUvhP+uW6+OuQ3JzsebEKB/mJYHjbowXvcncVLwUKxPIH8ABB9rEcgIUmm0gHHAQtrIOvXkFmvNf41arC5n0cCOOZRjIab8xFXC+hW8uHfLrMQ3g7YO2PqwIlSZoQUo+SE0rXcz/wjc6OPrBEC9zf1y/5x3Q79lL3xwgCO7mZoGZlRVt3orx07BOUECHWgDrq016EXZQoAv12lB3yis9y6fveX1l0RNlYAWYOvJIqa7gxhW9WMD0yzM+7tYpNVwYiDzgOUniuBSYdXnWy0323r7ug52mNvHJw/LX705Y8diGXJ9xYh2oGXHyeHxl3n5P2YOpzx9+69TZecdvmxFypA7StLv+0FcTT26973DZ9o2RvtjFVNUQe+tLUzYtXIuHvn8htQP03fvpmbKhVzYfa9tWW755+uDJW372fbtKyPwiDV284/GjB3v2fDl4qK5zx/mceHHFwjdffe2J/fvbjttn5j5nbN5dL344uFf2nDtW/XKNMmN79Ommp0J/tFX+sOw9q7Nq3ZaKOaeWrFLxkR8PPD+w9ZmdyxY++kXqu6odR+rgmoNT3/6tZ/0jZ5kq39rz3E8P8L4Dey9sQ6x40MmcOzqpc/wgu+oU3tXhMdtm7vto24uxC5/t2vT+8vGT7590ur1r564tvzc8+433ztmMZ8Pcjz9B++/Zd37jiTcODKfvT4TYKxw8DgAA';
var map = null;
var infoWindow;
var searchVal;
var obj = [];
var jsonLocation = [];

var app = new Clarifai.App(
    'MSvYSyN_ItFs5xu52i6XWgyny7gz2k2wvQYZWdoL',
    '-cjD0Rf4AB40DLuZ2mrIb9htyIK-UK4s7SkVVxOO'
);

console.log ("Starting...");

// AJAX calls

$(document).ready(function() {
    $('#txt_btn').click(function() {
        var searchVal = $('#txt_name').val();

        app.models.predict(Clarifai.GENERAL_MODEL, searchVal).then(
            function(response) {
                var obj = [
                    response.outputs[0].data.concepts[0].name,
                    response.outputs[0].data.concepts[1].name,
                    response.outputs[0].data.concepts[2].name,
                    response.outputs[0].data.concepts[3].name
                ];
                if (obj == "no person") {
                    obj = "product"
                    console.log(obj);
                }

                var rand = obj[Math.floor(Math.random() * obj.length)];

                console.log(response.outputs[0].input.data.image.url);
                objects(rand);
            },
            function(err) {
                console.error(err);
            }
        );
        function objects(rand){
            $.ajax({
                url: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=' + rand + '&limit=10&offset=100&filter=itemLocationCountry:NL&filter=condition:USED',
                type: 'GET',
                dataType: 'JSON',
                headers: { 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer '+ authToken
                },
                success: function(data) {
                    console.log('object name: ' + rand);
                    var json = $.parseJSON(JSON.stringify(data));        
                    console.log(json);


                    $.each(json.itemSummaries, function(j, index) {
                        
                        jsonLocation = [ 
                            json.itemSummaries[j].itemLocation.postalCode,
                            json.itemSummaries[j].title,
                            json.itemSummaries[j].seller.username,
                            json.itemSummaries[j].price.value,
                            json.itemSummaries[j].image.imageUrl,
                            json.itemSummaries[j].itemWebUrl
                        ]

                    });

                        console.log(jsonLocation);

                        var priceVar = jsonLocation[3];
                        console.log("price: " + priceVar);

                        $.ajax({
                            url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+ jsonLocation[0] +'&key=AIzaSyBUg2DfJLopuzyKbLXhjc7V_DqYkpzQjEk',
                            type: 'GET',
                            dataType: 'JSON',
                            success: function(data) {
                                var json= $.parseJSON(JSON.stringify(data));
                                console.log(jsonLocation);

                                $('<div/>',{
                                    'id': 'info'
                                }).appendTo('#info_box');

                                var boxTitle = $('<h1 class="boxTitle">Your match</h1>');
                                boxTitle.appendTo('#info');

                                var title = $('<h4 class="advheader">'+ jsonLocation[1] +'</h4>');
                                title.appendTo('#info');

                                var seller = $('<p class="advseller"> <b>Seller:</b> <br> '+ jsonLocation[2] +'</p>');
                                seller.appendTo('#info');

                                var price = $('<p class="advprice"> <b>Price:</b> <br> €'+ jsonLocation[3] +'</p>');
                                price.appendTo('#info');

                                var loc = $('<p class="advloc"> <b>Location:</b> <br> '+ json.results[0].formatted_address +'</p>');
                                loc.appendTo('#info');

                                var img = $('<img class="advimg">'); //Equivalent: $(document.createElement('img'))
                                img.attr('src', jsonLocation[4]);
                                img.appendTo('#info');

                                var button = $('<a class="advbtn btn btn-primary" href="'+ jsonLocation[5] +'" role="button">Contact directly</a>');
                                button.appendTo('#info_box');

                                console.log(jsonLocation[0]);

                                 if (jsonLocation[0] == null) {
                                    jsonLocation[0] == "3144LE";
                                    console.log("No location found, using default location")
                                }
                                
                                var coords = [
                                json.results[0].geometry.location.lat,
                                json.results[0].geometry.location.lng
                                ];

                                initMap(coords, jsonLocation, json);
                                createMakers(coords, map);
                                console.log("coords: " + coords);

                                function initMap(coords, jsonLocation, json) {

                                  var latlng = new google.maps.LatLng(coords[0], coords[1]);
                                  console.log("latlng: " + latlng);
                                  
                                    map = new google.maps.Map(document.getElementById('map'), {
                                    zoom: 8,
                                    center: latlng, /* COORDS VAR */
                                    draggable: true, 
                                    zoomControl: false, 
                                    scrollwheel: false, 
                                    disableDoubleClickZoom: true,
                                    styles: [
                                              {
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#242f3e"
                                                  }
                                                ]
                                              },
                                              {
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#746855"
                                                  }
                                                ]
                                              },
                                              {
                                                "elementType": "labels.text.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#242f3e"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "administrative.locality",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi.park",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#263c3f"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "poi.park",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#6b9a76"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#38414e"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "geometry.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#212a37"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#9ca5b3"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#746855"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "geometry.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#1f2835"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "road.highway",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#f3d19c"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "transit",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#2f3948"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "transit.station",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#d59563"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "geometry",
                                                "stylers": [
                                                  {
                                                    "color": "#17263c"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "labels.text.fill",
                                                "stylers": [
                                                  {
                                                    "color": "#515c6d"
                                                  }
                                                ]
                                              },
                                              {
                                                "featureType": "water",
                                                "elementType": "labels.text.stroke",
                                                "stylers": [
                                                  {
                                                    "color": "#17263c"
                                                  }
                                                ]
                                              }
                                            ]
                                    });

                                    infoWindow = new google.maps.InfoWindow;

                                    if (navigator.geolocation) {
                                      navigator.geolocation.getCurrentPosition(function(position) {
                                        var pos = {
                                          lat: position.coords.latitude,
                                          lng: position.coords.longitude
                                        };

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

                                };

                                    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
                                        infoWindow.setPosition(pos);
                                        infoWindow.setContent(browserHasGeolocation ?
                                                              'Error: The Geolocation service failed.' :
                                                              'Error: Your browser doesn\'t support geolocation.');
                                        infoWindow.open(map);
                                    }

                                    function createMakers(coords, map){
                                        var marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(coords[0], coords[1]),
                                            map: map,
                                            animation: google.maps.Animation.DROP,
                                            icon: 
                                            {
                                                url: cstmMarker
                                            },
                                            title: "Hello World"
                                        });  

                                        var infowindow = new google.maps.InfoWindow({
                                          content: "<b>"+jsonLocation[1]+"</b><br><u>Seller: <i>"+jsonLocation[2]+"</u></i><br> $"+jsonLocation[3]
                                        }), marker, i;

                                        marker.addListener('click', function() {
                                            infowindow.open(map, marker);
                                        });
                                    }
                            }
                      });
                }
            }); 
        }
    }); 
});
