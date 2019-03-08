
const map = L.map('map').setView([35.0844, -106.6504], 13);
const accessToken = 'pk.eyJ1Ijoic2FuZGVyZGoiLCJhIjoiY2pzejBlMWh3MThybTRhb2RiMXFodDdyNSJ9.-Nm4Q0ksZ4geOwro6bUnmw'

//adds the open street map layer
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken, {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.dark',
    accessToken: accessToken
}).addTo(map);

//control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); //creates a div with class 'info'
    this.update();
    return this._div;
};

//method that we will use to update the control based on feature prop passed
info.update = function (props) {
    this._div.innerHTML = '<h4>ABQ Historic Places </h4>' + (props ? 
        '<b>' + props.Name + '</b><br />' +
        '<b>' + props.REGISTRATIONTYPE + '</b><br />'
        : 'Hover over a Historic Place');
};

info.addTo(map);


function style(feature) {
    return {
        fillColor: '#034e7b',
        weight: 2,
        opacity: 1,
        color: 'blue',
        dashArray: '3',
        fillOpacity: 0.7
    };

   
}



function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color:'yellow',
        dashArray: '',
        fillOpacity: 0.7

    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    info.update(layer.feature.properties);
}

let geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(histPlaces, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//add a legend?
