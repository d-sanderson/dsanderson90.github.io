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
let cbArr;
    fetch(cbUrl)
      .then(res => res.json())
      .then(data => console.log(data))
      .then(data => censusBlockData = data)
      .then(censusBlockData => L.geoJSON(censusBlockData, {style: censusBlockStyle}).addTo(map));
      
//grab tweet data

const twtUrl = 'data/Twitter_141103_w_fields_deduped.geojson'

let twtData;

    fetch(twtUrl)
      .then(res => res.json())
      .then(data => twtData = data)
      .then(twtData => console.log(twtData))

//grab fb data
const fbUrl = 'data/FacebookPlaces_Albuquerque_w_fields_deduped.geojson'
let fbData;
    fetch(fbUrl)
      .then(res => res.json())
      .then(data => fbData = data)
      .then(data => console.log(data))
    
let fbPlaces = L.geoJson(facebookData, {
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
            })
let tweets = L.geoJson(tweetData, {
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
    '<img src="./images/twitter.png"><br>Tweets': tweets,
    '<img src="./images/facebook.png"><br>Facebook Places' : fbPlaces,

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

//create a home control in the top right corner + add it to the map [vanilla leaflet way]
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

//add it to the map
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

//easy button plugin which toggles the sidebar plugin
L.easyButton('<span class="target">&quest;</span>', function() {
    sidebar.toggle();
}).addTo(map);

//hide the sidebar on map click
map.on('click', function () {
    sidebar.hide();
})

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

//filter places by category
function getPlacesbyCategory(category) {
    let places = fbArr.filter(el => el.properties.category === category);
    let para = document.createElement('p');
    para.textContent = ` There are ${places.length} places that match the ${category} category`;
    document.getElementById('fb').appendChild(para);
    for (var i=0; i < places.length; i++) {
        var lon = places[i].geometry.coordinates[0];
        var lat = places[i].geometry.coordinates[1];
        var popupPlace = `
            <img src="./images/facebook.png">
            <h1> ${places[i].properties.place}</h1>
            <p> Business Type: ${places[i].properties.category} </p> 
            <p># of check-ins ${places[i].properties.checkins} </p>
        `
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation);
         map.addLayer(marker);
     
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

for (let i = 0; i < categories.length; i++) {
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

for (let i = 0; i < users.length; i++) {
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

let usersByNumOfTweets = twtArr.map(el => [el.properties.username, el.properties.tweet]).sort();

function getTweetsByUser(username) {
    userTweets = twtArr.filter(el => el.properties.username === username)
    let para = document.createElement('p');
    para.textContent = ` There are ${userTweets.length} tweets from ${username}`
    document.getElementById('twt').appendChild(para);
    for (var i=0; i < userTweets.length; i++) {
           
        var lon = userTweets[i].geometry.coordinates[0];
        var lat = userTweets[i].geometry.coordinates[1];
        var popupTweet = `
        On ${userTweets[i].properties.time} ${userTweets[i].properties.username} 
        tweeted:  ${userTweets[i].properties.tweet}`
        var markerLocation = new L.LatLng(lat, lon);
        var marker = new L.Marker(markerLocation);
         map.addLayer(marker);
     
         marker.bindPopup(popupTweet);
     
     }
    return userTweets;

    
}

userselect.addEventListener('change', (e) => { getTweetsByUser(userselect.value);});