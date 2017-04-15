var cstmMarker = "src/img/marker.png";

console.log ("Loading...");

        $.ajax({
            url: 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=' + 'galaxy s7' + '&limit=50&offset=50&filter=itemLocationCountry:NL',
            type: 'GET',
            dataType: 'JSON',
            async: true,
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer v^1.1#i^1#r^0#p^3#f^0#I^3#t^H4sIAAAAAAAAAOVXbWwURRjutdcqlKohRKUt4bogiZq929mvu116Z44e0BJKD640tAba2d25dmFv99jZa3s1StMIfhASSZQY4gcElYBgEC1ojDbGaEj8QYQUMeoPNBDQHxAxEgwGZ68ftDUF2vKjiffnMjPv1/O8z8zOMN1FM57YVr3tWonnvvw93Ux3vscDipkZRYVPPlCQX1qYx4ww8OzpXtjt7Sm4WIlhykjLaxBOWyZGvs6UYWI5NxmmMrYpWxDrWDZhCmHZUeVEtHalzPoZOW1bjqVaBuWriYUpEWlQFVmNV8WkCDiBzJpDMeutMAWlEItUjtOEJMspDCLrGGdQjYkdaDphimVAkGZ4Ggj1LCsDSQZBvySwTZSvAdlYt0xi4meoSK5cOedrj6j19qVCjJHtkCBUpCa6LFEXrYktXVVfGRgRKzLIQ8KBTgaPHlVZGvI1QCODbp8G56zlREZVEcZUIDKQYXRQOTpUzCTKH6CaVYEgBiELFAiRcm+oXGbZKejcvg53RtfoZM5URqajO9k7MUrYUDYi1RkcrSIhamI+9291Bhp6Ukd2mFq6JNq4NrF0DeVLxOO21a5rSHORAsCzXIgXAE9F2rDZlTXVwRQDcQYJHpOjyjI13aUL+1ZZzhJE6kVjWWFGsEKM6sw6O5p03FqG7cR6hhlijxea3HYO9C/jtJluR1GKUODLDe/M/ZAYbrX/XsmBZTQYFHheCrK8okAwjhzcvT4hSUTcrkTj8QBSYJZOQXsTctIGVBGtEmozKWTrmszzCi9CNUlzbEileU1QaUkSEM0iEYks5Hgmyf8/VOE4tq5kHDSsjLELOXhhKqFaaRS3DF3NUmNNcmfMoA46cZhqc5y0HAh0dHT4Ozi/ZbcGWIYBgXW1KxNqG0pBathWv7MxrecUoZLzgtjLTjZNqukkgiPJzVYqwtlaHNpONoEMg0wMyXVUbZGxs+OAxC7I6QXP9cckAEzrflfRftVKBSxIdq871Zyr2Hc3RgFMCPIP7AcS2W8jqFmmkZ2M8wR8dLOdiMqys3eR0N3r4weYQFKoqlbGdCaDcdB1Ah7JjJHUDcPdO5NJOMJ9ImWa0Mg6uoqHU05J+NF0ukabXsKvhhiadV2Qjtu6Sj4LGh1fE6MRIwEecCFAK5oYlHgoTAm3htpJ8GZ9mmE3M4YxJVy1rdMNUoiXRDYIOJF4uSDIXq+YNLwYap9ucuUYVUFAkOgggUhuFJCjQ2owSUtaKKixmhLUoDSlllYZOjki6rPT7QNVbWEHaVODRu6F0wuUe9QMnTQhKLI0UEIhmhckRCtJRaIZUVHvFnJg3IvWf27WgdGP2khe7gd6PL1Mj+dD8i5mAsxjYAFTUVSw1lswqxTrDvLrMOnHeqtJ3mo28m9C2TTU7fwiz9PlRw40j3hG71nPPDr8kJ5RAIpHvKqZ8lsrheDBR0pAkOGBwLJAAsEmZsGtVS942DvnoU+UN70mt3H5xa6FP/9+LL1g5vuvMSXDRh5PYZ63x5PX9Otl79+FM/X1auN3XRU7dpYtammsePn0+ct21RtXLp/cqj3fh9cdWx+vvda//Bu9t/dq2/dfm8W18R3P/BL6tnZF597lvVv2bfux9s8VDafF2F5tdv+iDcf72g+B0uYLW46+4N317DubDr89dx5VdvWVA03n/pr/aeO5/bvPyLt/KpWOt3T89taNL15/9Ur5oa1AiJ24Hnmqv/xS6MrBkwo3s/+5Uy2Pg4v7z3y+c9aX/5w6/9XmXVbxondX39i/ceXh7fkF+UdLSufOzffHNu/zXLrgXO+bnd5+87MTTXOW/KG81LKh4epHiz9o2R7/4XpwZ9+R+WfXhcsqe8XKxZfK7n/x6Hsf593sPFg9r+TsQPv+BSD/1vPgEAAA' 
            },
            success: function(data) {
                var json = $.parseJSON(JSON.stringify(data));
                var jsonLocation = json.itemSummaries[6].itemLocation.postalCode;
                
                console.log(jsonLocation);
            }
        });
        $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json?address=3144LE&key=AIzaSyCWeTzYEtS3-cLmr-YRkTVeP2hNcgTEsWk',
            type: 'GET',
            dataType: 'JSON',
            async: false,
            success: function(data) {
                
                var json= $.parseJSON(JSON.stringify(data));
                
                var markerLat = (json.results[0].geometry.location.lat);
                var markerLng = (json.results[0].geometry.location.lng);

                alert(markerLat + ' | ' + markerLng);

                console.log('all done');

            }
        });
    

function initMap() {

  var latlng = {
    lat: 53.1946278, 
    lng: 6.575673699999999
};
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: latlng,
    draggable: false, 
    zoomControl: false, 
    scrollwheel: false, 
    disableDoubleClickZoom: true,
    styles: [
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 33
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2e5d4"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5dac6"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "lightness": 20
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#c5c6c6"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#e4d7c6"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry",
        "stylers": [
            {
                "color": "#fbfaf7"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#acbcc9"
            }
        ]
    }
]
  });
  var marker = new google.maps.Marker({
    position: latlng,
    map: map,
    animation: google.maps.Animation.DROP,
    icon: {
      url: cstmMarker
      }
  });

  var infowindow = new google.maps.InfoWindow({
    content: "<b>"+"Title"+"</b><br>"+"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem."
  });

  marker.addListener('click', function() {
      infowindow.open(map, marker);
  });

}

