var Clarifai = require('clarifai');

var cstmMarker = "src/img/marker.png";

// Expiring access token => replace if unauthorized
var authToken = 'v^1.1#i^1#r^0#I^3#f^0#p^1#t^H4sIAAAAAAAAAOVXe2wURRjvtb2aBlCjBMvD9LqgjeLuzeztPXbDXXK0EBoprVx5tOXh3u5su3Rv99yZsz0NsSkJvkMQgybFUAWhKCoS66sJIQoR9Q/BRIyRRPhDJQiJUYIYAzq7d5RrJTyLkHj/XOabb775/X7f983sgO6y8vtXz1n9xzjPLcV93aC72OOBY0B5mXf6rSXFk7xFoMDB09c9rbu0p+ToDCynjLQ0H+G0ZWLk60oZJpZcY5TJ2KZkyVjHkimnEJaIIiXi9XMlngNS2raIpVgG46urjTIC5NVIJABQUozIPNSo1TwXs8mKMqIaEYKiygdCfDgS0RQ6j3EG1ZmYyCaJMjyAYRYILA+beCAJogRELhAMtjC+hcjGumVSFw4wMReu5K61C7BeHKqMMbIJDcLE6uKzEw3xutpZ85pm+AtixfI6JIhMMnj4qMZSkW+hbGTQxbfBrreUyCgKwpjxx3I7DA8qxc+BuQr4rtSRsBoMA0BlFkRFSY6OlLMtOyWTi+NwLLrKaq6rhEyik+ylFKVqJFcgheRH82iIulqf8/dQRjZ0TUd2lJk1M94cb2xkYnNkLJsNj8lso60rlJHKNs6vZREQoQADEcgm1VBYFORgfqNctLzMI3aqsUxVd0TDvnkWmYkoajRSm0CBNtSpwWyw4xpxEBX68ec0FEItTlJzWcyQdtPJK0pRIXzu8NIZGFpNiK0nMwQNRRg54UoUZeR0WleZkZNuLebLpwtHmXZC0pLf39nZyXUGOMtu8/MAQP/i+rkJpR2lZIb6Or2e89cvvYDVXSoKoiuxLpFsmmLporVKAZhtTIwXoBgK5HUfDis20vovQwFn//COGK0O0UQeJiEMIAhDkWRIHI0OieWL1O/gQEk5y6ZkuwORtCEriFVonWVSyNZVKRDU+EBEQ6waEjVWEDWNTQbVEAs1hABCyaQiRv5PjXK5pZ5QrDRqtAxdyY5KwY9asQdstVG2STaBDIMaLrfqL0gSOySvOz2n16+IohMD0yByWuec2uYUK+W3ZHqoOablLupr4q3T+/CmSiolmGOqq7mLjHPpcvhRhbMRtjI2vcO5Budcb7I6kEm7hNiWYSB7IbwmJUbvRL9Bp/kFWSmGTmVcfrMxu8Jj8iprWyY3kHVpj6f1AsyhIPIREA4L4jVxq3Hz2pT9Dw6tK0ushQlSr8MHiH/4cyhW5P5gj2cA9HjepS8q4Af3wKmgqqxkQWnJ2ElYJ4jTZY3DeptJv/JtxHWgbFrW7eIyT+uUHduWFzzA+paCiqEnWHkJHFPwHgNTzs944W13jYNhIPCQB4IIxBYw9fxsKZxQOv7o87/U/z7ArJ+08a2v132R7f9+1xOtYNyQk8fjLaKVUbQyVrk7ddjY/srhLbv3vbjk6E9dp0+UL9q64rmiD894FlVs6524taby9XWnjjxzoOZkhbV9C/+B9HPv2ul3L9s/+ODTvgnf/shM5ufs2Vbcsz3xt/oC2UJOrlEmqsHNZ2oX3ztl896q2vU7SWLZ503ex++z2Gf9s2dVfnWw/eS0E8eVlQf7j1Xc/tE3b09e0fpDeN2xTUzHJ0vCK0/1V1sdAy+rJemJa3btOzD2s0NLq7qbq8uaD/UeeSRENrRtWPrqAzsOaGc/nVHxZvNff7Y/ueol79kx/XcMSGAwUb13cN93FWXjoSe06rUJ74f2bKp6w7vg1K8bd55OBisf/vj4+Ln7d+4S3llzp/TeU52/fZlL3z9lFOv/Gg8AAA==';
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
    $('#txt_btn').on('click', function() {
        var searchVal = $('#txt_name').val();
        var $btn = $(this).button('loading');
        // business logic...
        $btn.button('reset');

        app.models.predict("e0be3b9d6a454f0493ac3a30784001ff", searchVal).then(
            function(response) {
                var obj = response.outputs[0].data.concepts[0].name;
                if (obj == "no person") {
                    obj = "product"
                    console.log(obj);
                }

                //var rand = obj[Math.floor(Math.random() * obj.length)];

                console.log(response.outputs[0].input.data.image.url);
                objects(obj);
            },
            function(err) {
                console.error(err);
                var unAuth = "<b>Bad Request!</b> Please fill in an image url...";
                var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                errorMessage.appendTo('.error');
            }
        );
        function objects(obj){
            $.ajax({
                url: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=' + obj + '&limit=10&offset=100&filter=itemLocationCountry:NL&filter=condition:USED',
                type: 'GET',
                dataType: 'JSON',
                headers: { 
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer '+ authToken
                },
                statusCode: {
                  400:function() { 
                    var unAuth = "<b>Bad Request!</b> Please fill in an image url!.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  },
                  401:function() { 
                    var unAuth = "<b>Oh snap!</b> You are unauthorized, please refresh your token.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  },
                  500:function() { 
                    var unAuth = "<b>Oh snap!</b> Internal Server Error.";
                    var errorMessage = $('<div class="alert alert-danger" role="alert">'+ unAuth +'</div>');
                        errorMessage.appendTo('.error');
                  }
                },
                success: function(data) {
                    console.log('object name: ' + obj);
                    var json = $.parseJSON(JSON.stringify(data));        
                    console.log(json);

                    var mapId = $('<div id="map"></div>');
                    mapId.appendTo('.maps');

                    $('#txt_btn').css('background-color','#09A854');
                    $("#txt_btn").text('Success');

                    function disable(i){
                        $("#txt_btn"+i).prop("disabled",true);
                    }

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
