//initialize the map on the map div with center and zoom on ABQ
const map = L.map('map');

//store access token, MapBox Url, and attribution in variables
const accessToken = 'pk.eyJ1Ijoic2FuZGVyZGoiLCJhIjoiY2pzejBlMWh3MThybTRhb2RiMXFodDdyNSJ9.-Nm4Q0ksZ4geOwro6bUnmw';
const mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken;
const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'
//adds the open street map tile layer

//FETCH REQUESTS

//grab census data

const cbUrl = 'data/berncensusblocks.geojson'
let censusBlockData;
    fetch(cbUrl)
      .then(res => res.json())
      .then(data => censusBlockData = data)
      .then(censusBlockData => L.geoJSON(censusBlockData, {style: censusBlockStyle}).addTo(map));

//grab tweet data

const twtUrl = 'data/Twitter_141103_w_fields_deduped.geojson'

let twtData;

    fetch(twtUrl)
      .then(res => res.json())
      .then(data => twtData = data)

//grab fb data
const fbUrl = 'data/FacebookPlaces_Albuquerque_w_fields_deduped.geojson'
let fbData;
    fetch(fbUrl)
      .then(res => res.json())
      .then(data => fbData = data)
    
let fbPlaces = L.geoJson(facebookData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: 1,
                fillColor: '#3b5998',
                color: '#3b5998',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
                });
        },
        onEachFeature: function (feature, layer) {
            layer.bindPopup(`<h1> ${feature.properties.place}</h1>
            <p> Business Type: ${feature.properties.category} </p> 
            <info># of check-ins ${feature.properties.checkins} </info>`)
            
            layer.on('mouseover', function(e) {
                this.openPopup();
                });
                layer.on('mouseout', function(e) {
                    this.closePopup();
                })
                }
            })
let tweets = L.geoJson(tweetData, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 1,
            fillColor: '#1DA1F2',
            color: '#1DA1F2',
            weight: .2,
            opacity: 1,
            fillOpacity: 0.8});
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<h1> ${feature.properties.username}</h1>
        <p> ${feature.properties.tweet} </p> 
        <small> ${feature.properties.time} </small>`)
    }
})            

function censusBlockStyle(feature) {
        return {
            fillColor: 'none',
            weight: 2,
            opacity: 1,
            color: '#ffbf00',
            dashArray: '',
            fillOpacity: 0.3
        };
    }

let darkmode = L.tileLayer(mbUrl, {
    attribution: mbAttr,
    minZoom: 8,
    maxZoom: 20,
    id: 'mapbox.dark'
    }).addTo(map);
    
let streets = L.tileLayer(mbUrl, {
    attribution: mbAttr,
    minZoom: 8,
    maxZoom: 20,
    id: 'mapbox.streets'
    });
//set the defaut map view
map.setView([35.0844, -106.6504], 10)
let baseLayers = {
    'Streets': streets,
    'Darkmode': darkmode,
    }    

let overlays = {
    'Tweets': tweets,
    'Facebook Places' : fbPlaces,

}

L.control.layers(baseLayers, overlays).addTo(map);

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'yellow',
        dashArray: '3',
        fillOpacity: '0.4'
    })

    if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
       info.update(layer.feature.properties) 
    }
}

function resetHighlight(e) {
   
    tweets.resetStyle(e.target);
    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        
    })
}

// CONTROLS

//create a control in the top right corner
let homeControl = L.control({position: 'topright'});

//create a div and button
homeControl.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'container');
    div.innerHTML = '<button class="homebtn">&lt</button>'
    return div;
}

//Resets the home view
function flyHome() {
    map.flyTo([35.0844, -106.6504], 10)
}

//add it to the map
homeControl.addTo(map);
//vanilla js event listener
document.querySelector('.homebtn').addEventListener('click', flyHome)

//create a sidebar using leaflet plugin and add it to the top left with .addControl
let sidebar = L.control.sidebar('sidebar', {
    closeButton: true,
    position: 'left'
});
map.addControl(sidebar);
//show the sidebar a half second after page load
setTimeout(function () {
    sidebar.show();
}, 500);

//easy button plugin which toggles the sidebar plugin
L.easyButton('<span class="target">&quest;</span>', function() {
    sidebar.toggle();
}).addTo(map);

//hide the sidebar on map click
map.on('click', function () {
    sidebar.hide();
})

// sidebar.on('show', function () {
//     console.log('Sidebar will be visible.');
// });

// sidebar.on('shown', function () {
//     console.log('Sidebar is visible.');
// });

// sidebar.on('hide', function () {
//     console.log('Sidebar will be hidden.');
// });

// sidebar.on('hidden', function () {
//     console.log('Sidebar is hidden.');
// });

L.DomEvent.on(sidebar.getCloseButton(), 'click', function () {
    console.log('Close button clicked.');
});



