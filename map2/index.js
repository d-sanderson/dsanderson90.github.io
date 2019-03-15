//initialize the map on the map div with center and zoom on ABQ
const map = L.map('map');

//store access token, MapBox Url, and attribution in variables for later us
const accessToken = 'pk.eyJ1Ijoic2FuZGVyZGoiLCJhIjoiY2pzejBlMWh3MThybTRhb2RiMXFodDdyNSJ9.-Nm4Q0ksZ4geOwro6bUnmw';
const mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken;
const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

//store filepaths
const cbUrl = 'data/berncensusblocks.geojson'
const twtUrl = 'data/Twitter_141103_w_fields_deduped.geojson'
const fbUrl = 'data/FacebookPlaces_Albuquerque_w_fields_deduped.geojson'

      
let cbLayer = new L.GeoJSON.AJAX(cbUrl, {
    onEachFeature: onEachFeature,
    style: style
});

let tweetLayer = new L.GeoJSON.AJAX(twtUrl, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 2,
            fillColor: '#1DA1F2',
            color: '#1DA1F2',
            weight: .2,
            opacity: 1,
            fillOpacity: 0.8});
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`
        <img src="./images/twitter.png">
        <h1> Username: ${feature.properties.username}</h1>
        <blockquote> ${feature.properties.tweet} </blockquote> 
        <p><b> Date of Tweet ${feature.properties.time.toLocaleString()} <b><p>`)
    }
});

cbLayer.addTo(map);

let fbLayer = new L.GeoJSON.AJAX(fbUrl, {
    pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, {
            radius: 3,
            fillColor: '#3b5998',
            color: '#3b5998',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
            });
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`
        <img src="./images/facebook.png">
        <h1> ${feature.properties.place}</h1>
        <p> Business Type: ${feature.properties.category} </p> 
        <p># of check-ins ${feature.properties.checkins} </p>`)
        
        layer.on('mouseover', function(e) {
            this.openPopup();
            });
            layer.on('mouseout', function(e) {
                this.closePopup();
            })
            }
        });
   
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

//set the default map view 
map.setView([35.0844, -106.6504], 10)
let baseLayers = {
    'Streets': streets,
    'Darkmode': darkmode,
    }    

let overlays = {
    '<img src="./images/twitter.png"><br>Tweets': tweetLayer,
    '<img src="./images/facebook.png"><br>Facebook Places' : fbLayer,

}

//Add base layers and overlays to the map and store control in variable

let lcontrol = L.control.layers(baseLayers, overlays).addTo(map);

function getColor(d) {
    return d > 2000 ? '#4a1486' :
           d > 100  ? '#6a51a3' :
           d > 500  ? '#807dba' :
           d > 250  ? '#9e9ac8' :
           d > 100  ? '#bcbddc' :
           d > 50   ? '#dadaeb' :
           d > 10   ? '#efedf5' :
                      '#fcfbfd' ;
}

function style(feature, def = 'ACS_13_5YR_B01001_with_ann_HD01_VD01' ) {
  return {
    fillColor: getColor(feature.properties[def]),
    weight: 2,
    opacity: 1,
    color: 'white',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function highlightFeature(e) {
    let layer = e.target;

    layer.setStyle({
        weight: 5,
        color: 'yellow',
        dashArray: '3',
        fillOpacity: '0.4'
    })

    if(!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
   
    cbLayer.resetStyle(e.target);
    
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function censusInfo() {

    let popupcontent = [];
    
    for (prop in feature.properties) {
        //only display properties relating to ACS SEX BY AGE (B01001)
        if (prop.includes('ACS_13_5YR_B01001') ) {

        popupcontent.push(prop + ":" + feature.properties[prop]);

    }
    }
    let popup = L.popup({maxHeight: 225}).setContent(popupcontent.join("<br />"))
    layer.bindPopup(popup);
        }
        
    })
}

// CONTROLS

//create a home control (back button) in the top right corner + add it to the map [vanilla leaflet way] 
let homeControl = L.control({position: 'topright'});

//create a div and button
homeControl.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'cont');
    div.innerHTML = '<button class="homebtn">&lt</button>'
    return div;
}

//Resets the home view
function flyHome() {
    map.flyTo([35.0844, -106.6504], 10)
}

//easy button plugin which toggles the sidebar plugin
L.easyButton('<span class="target">&quest;</span>', function() {
    sidebar.toggle();
}).addTo(map);

//add the homeControl to the map
homeControl.addTo(map);
//add vanilla js event listener
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



//hide the sidebar on map click
map.on('click', function () {
    sidebar.hide();
})

L.easyButton('<span class="target">clr</span>', function() {
    fbMarkers.clearLayers();
    twtMarkers.clearLayers();
    document.querySelector('.fb-info').remove();
}).addTo(map);

//FILTERING

//turn Objects into arrays to so array methods can be used.
let fbArr = Object.values(facebookData.features)

let twtArr = Object.values(tweetData.features)

//Facebook data filtering
//filter place by # of check-ins greater than value
function filterByCheckins(numOfCheckIns) {
let localbiz = fbArr.filter(el => el.properties.checkins > numOfCheckIns)
return localbiz;
}

var fbMarkers = L.layerGroup().addTo(map);
//filter places by category
function getPlacesbyCategory(category) {

    let places = fbArr.filter(el => el.properties.category === category);
    let para = document.createElement('p');
    para.className = 'fb-info'
    para.textContent = ` There are ${places.length} places that match the ${category} category`;
    document.getElementById('fb').appendChild(para);
    for (let i=0; i <= places.length; i++) {

        let lon = places[i].geometry.coordinates[0];
        let lat = places[i].geometry.coordinates[1];

        let popupPlace = `
            <img src="./images/facebook.png">
            <h1> ${places[i].properties.place}</h1>
            <p> Business Type: ${places[i].properties.category} </p> 
            <p># of check-ins ${places[i].properties.checkins} </p>
        `
        let markerLocation = new L.LatLng(lat, lon);
        let marker = new L.Marker(markerLocation);
         marker.addTo(fbMarkers)
     
         marker.bindPopup(popupPlace);
     
     }
    return places;

}

//map all the biz categories into category array, remove duplicates, and sort alphabetically.
let categories = fbArr.map(el => el.properties.category)
categories = categories.filter((el, i) => categories.indexOf(el) === i)
categories = categories.sort();

document.getElementById('fb').innerHTML = 
`There are <b>${fbArr.length}</b> Facebook Places
and <b>${categories.length}</b> different categories.
` 

let placeselect = document.querySelector('.placeselect')

for (let i = 0; i <= categories.length; i++) {
    let opt = categories[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    placeselect.appendChild(el);
  }

  placeselect.addEventListener('change', (e) => getPlacesbyCategory(e.target.value))

//map all users into user array, remove duplicates, and sort alphabetically.
let users = twtArr.map(el => el.properties.username);
users = users.filter((el, i) => users.indexOf(el) === i)
users = users.sort();

let userselect = document.querySelector('.userselect')

for (let i = 0; i <= users.length; i++) {
    let opt = users[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    userselect.appendChild(el);
  }

document.getElementById('twt').innerHTML = 
`There are <b>${twtArr.length}</b> Tweets from 
 ${users.length} unique users.
` 

//map users and corresponding tweet into array, sort by users name, and reduce to calculate array with number of tweets by user


var twtMarkers = L.layerGroup().addTo(map);
function getTweetsByUser(username) {
    //find all tweets belonging to entered user
    userTweets = twtArr.filter(el => el.properties.username === username)

    let para = document.createElement('p');
    para.className = 'fb-info';
    para.textContent = ` There are ${userTweets.length} tweets from ${username}`
    document.getElementById('twt').appendChild(para);
    
    for (let i=0; i <= userTweets.length; i++) {
           
        let lon = userTweets[i].geometry.coordinates[0];
        let lat = userTweets[i].geometry.coordinates[1];
        let popupTweet = `
        <img src="./images/twitter.png">
        <h1> Username: ${userTweets[i].properties.username} </h1>
        <blockquote> ${userTweets[i].properties.tweet} </blockquote> 
        <p><b> Date of Tweet ${userTweets[i].properties.time}  <b><p>`

        let markerLocation = new L.LatLng(lat, lon);
        let marker = new L.Marker(markerLocation);
         marker.addTo(twtMarkers)
     
         marker.bindPopup(popupTweet);
     
     }
    return userTweets; 
}

let numTweetsByUser = twtArr.reduce((users, value) => {
    users[value.properties.username] = users[value.properties.username] ? users[value.properties.username] + 1 : 1;
    return users;
})

userselect.addEventListener('change', (e) => { getTweetsByUser(userselect.value);});

let ageRange = [
    'Under 5 years',
    '5 to 9 years', 
    '10 to 14 years', 
    '15 to 17 years', 
    '18 and 19 years', 
    '20 years', 
    '22 to 24 years',
    '25 to 29 years',
    '30 to 34 years',
    '35 to 39 years',
    '40 to 44 years',
    '45 to 49 years',
    '50 to 54 years',
    '55 to 59 years',
    '60 and 61 years',
    '62 to 64 years',
    '65 and 66 years',
    '67 to 69 years', 
    '70 to 74 years', 
    '75 to 79 years', 
    '80 to 84 years', 
    '85 years and over'
    ]

    let maleageselect = document.querySelector('.maleageselect')
    let femaleageselect = document.querySelector('.femaleageselect')

for (let i = 0; i <= ageRange.length; i++) {
    let opt = ageRange[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    maleageselect.appendChild(el);
  }

  for (let i = 0; i <= ageRange.length; i++) {
    let opt = ageRange[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    femaleageselect.appendChild(el);
  }



//   function returnCensusProp() {

    let baseStr = '.ACS_13_5YR_B01001_with_ann_';
    str =  'HD01_VD04' ;

    let done = baseStr + str

    cbLayer.eachLayer(function (feature) {  
        if(feature.properties == done) {    
            layer.setStyle({
            fillColor: getColor(feature.properties[done]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7}) 
        }
      });
    cbLayer.setStyle({
       
      });

//   }

  let btn = document.getElementById('test');


  btn.addEventListener('click', returnCensusProp)