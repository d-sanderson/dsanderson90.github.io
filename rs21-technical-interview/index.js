//initialize the map on the map div with center and zoom on ABQ
const map = L.map('map');

//store access token, MapBox Url, and attribution in variables for later us
const accessToken = 'pk.eyJ1Ijoic2FuZGVyZGoiLCJhIjoiY2pzejBlMWh3MThybTRhb2RiMXFodDdyNSJ9.-Nm4Q0ksZ4geOwro6bUnmw';
const mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + accessToken;
const mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

//store filepaths for later use
const cbUrl = 'data/berncensusblocks.geojson'
const twtUrl = 'data/Twitter_141103_w_fields_deduped.geojson'
const fbUrl = 'data/FacebookPlaces_Albuquerque_w_fields_deduped.geojson'

//AJAX REQUESTS

//make AJAX request for census blocks, add onEachFeature functions and styling
let cbLayer = new L.GeoJSON.AJAX(cbUrl, {
    onEachFeature: onEachFeature,
    style: style
});
//add the census tract layer to the map
cbLayer.addTo(map);
//default view will show total population (darker tracts have higher pop. density)
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

  //Roll all census styling functions into an onEachFeature function 
  //which is used above when the cbLayer is added to the map
  function onEachFeature(feature, layer) {
      layer.on({

          //consider refactoring this to be outside of the onEachFeature function
          click: function censusInfo() {
    
        let popupcontent = [];
      
        for (prop in feature.properties) {
            //only display Total pop, total male pop and total female pop on popup content
            if (prop === 'ACS_13_5YR_B01001_with_ann_HD01_VD01') {
                popupcontent.push("Total Population : " + feature.properties[prop]);
            } 
            if (prop === 'ACS_13_5YR_B01001_with_ann_HD01_VD02') {
                popupcontent.push("Total Male Population: " + feature.properties[prop]);
          } 
            if (prop === 'ACS_13_5YR_B01001_with_ann_HD01_VD26') {
  
            popupcontent.push("Total Female Population: " + feature.properties[prop]);
      }
      }
        let popup = L.popup({maxHeight: 225}).setContent(popupcontent.join("<br />"))
        layer.bindPopup(popup);
          }    
      })
  }
//Make AJAX request to twtUrl, add each point as a circle markers, + bind popups
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


//Make AJAX request to fbUrl, add each point as a circle markers, + bind popups
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
//base layers for the map   
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

//set the default map view  so the zooms defined above don't change the default view
map.setView([35.0844, -106.6504], 10)
let baseLayers = {
    'Streets': streets,
    'Darkmode': darkmode,
    }    

let overlays = {
    '<img src="./images/twitter.png"><br>Tweets': tweetLayer,
    '<img src="./images/facebook.png"><br>Facebook Places' : fbLayer,

}

//Add base layers and overlays to the map 
L.control.layers(baseLayers, overlays).addTo(map);

//function which colors each feature according to total pop density
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

// CONTROLS

//create a home control (back button) in the top right corner + add it to the map [vanilla leaflet way] 
let homeControl = L.control({position: 'topright'});

//create a div with a button inside
homeControl.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'cont');
    div.innerHTML = '<button class="homebtn">&lt</button>'
    return div;
}

//helper function that resets the home view for the back button
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
//add the sidebar to the map
map.addControl(sidebar);
//show the sidebar a half second after page load
setTimeout(function () {
    sidebar.show();
}, 500);
//hide the sidebar on map click
map.on('click', function () {
    sidebar.hide();
})
//clear markers from the make and remove the first div with the class of .info.
//Minor bug: the clear button only removes one info entry at a time. 
L.easyButton('<span class="target">clr</span>', function() {
    fbMarkers.clearLayers();
    twtMarkers.clearLayers();
    document.querySelector('.info').remove();
}).addTo(map);

//FILTERING

//turn Objects into arrays to so they can be manipulating with array methods
let fbArr = Object.values(facebookData.features)

let twtArr = Object.values(tweetData.features)

//Facebook data filtering
//filter place by # of check-ins greater than entered value (currently unused)
function filterBizByCheckins(numOfCheckIns) {
    let localbiz = fbArr.filter(el => el.properties.checkins > numOfCheckIns)
    return localbiz;
}

//create an empty layer group to store fb place markers (so they can easily be removed later) and add it to the map.
var fbMarkers = L.layerGroup().addTo(map);
//filter facebook places by category
    function getPlacesbyCategory(category) {

    //create a new array with businesses that match the selected category
    let places = fbArr.filter(el => el.properties.category === category);
   
    //create a paragraph element that will contain info the selected category
    let para = document.createElement('p');
    para.className = 'info'
    para.textContent = ` There are ${places.length} places that match the ${category} category`;
    document.getElementById('fb').appendChild(para);
    
    //iterate over the places array and create a marker and a popup for each place 
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

//map all the businesss categories into categories array, remove duplicates, and sort alphabetically.
let categories = fbArr.map(el => el.properties.category)
categories = categories.filter((el, i) => categories.indexOf(el) === i)
categories = categories.sort();

document.getElementById('fb').innerHTML = 
`There are <b>${fbArr.length}</b> Facebook Places
and <b>${categories.length}</b> different categories.
` 
//grab the placeselect dropdown from the DOM and add each element of the categories array as a dropdown option
let placeselect = document.querySelector('.placeselect')

for (let i = 0; i <= categories.length; i++) {
    let opt = categories[i];
    let el = document.createElement("option");
    el.textContent = opt;
    el.value = opt;
    placeselect.appendChild(el);
  }
//add event listener to place select dropdown so user can search fb places by category
placeselect.addEventListener('change', (e) => getPlacesbyCategory(e.target.value))

//TWITTER FILTERING

//map all users into user array, remove duplicates, and sort alphabetically.
let users = twtArr.map(el => el.properties.username);
users = users.filter((el, i) => users.indexOf(el) === i)
users = users.sort();

//grab the userselect dropdown from the DOM and add each element of the users array as a dropdown option
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
//create a layer group to hold our tweet markers (for easy removal)
var twtMarkers = L.layerGroup().addTo(map);

//function which filters tweets by username and adds them to the map and info the side panel.
function getTweetsByUser(username) {
    //find all tweets belonging to entered user
    userTweets = twtArr.filter(el => el.properties.username === username)

    let para = document.createElement('p');
    para.className = 'info';
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

//event listener which binds the getTweetsByUser function to the userselect dropdown
userselect.addEventListener('change', (e) => { getTweetsByUser(userselect.value);});


//unused function which creates an array showing the username and their # of tweets
//this array is ordered alphabetically and not by # of tweets
let numTweetsByUser = twtArr.reduce((users, value) => {
    users[value.properties.username] = users[value.properties.username] ? users[value.properties.username] + 1 : 1;
    return users;
})

//age range array for male and female
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


//function that dynamically restyles the census tracts based on the demographic selected
//I think I could use an Object as a lookup table to refactor out the if statements (I would change these to switch statements or remove them entirely if I had more time)
// AND I would also use .setStyles() do away with removing the layer each time instead updating the styles on the existing cbLayer
//Minor bug: the function only removes the original cbLayer after that it stacks new layers on top of the existing newCbLayer(s)
  function restyleByFeatureProp(prop) {
    console.log(prop);
    let code = '';
    map.eachLayer(function (layer) {
        if (layer === cbLayer) {
        map.removeLayer(layer);
    }
    });

    if (prop === ageRange[0] && maleageselect.value === ageRange[0]) {
                code = 'ACS_13_5YR_B01001_with_ann_HD01_VD03';
    }
    else if (prop === ageRange[1] && maleageselect.value === ageRange[1]) {
                code = 'ACS_13_5YR_B01001_with_ann_HD01_VD04';
    }
    else if (prop === ageRange[2] && maleageselect.value === ageRange[2]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD05';
    }
    else if (prop === ageRange[3] && maleageselect.value === ageRange[3]) {
    code = 'ACS_13_5YR_B01001_with_ann_HD01_VD06';
    }
    else if (prop === ageRange[4] && maleageselect.value === ageRange[4]) {
        console.log(ageRange[4])
    code = 'ACS_13_5YR_B01001_with_ann_HD01_VD07';
    }
    else if (prop === ageRange[5] && maleageselect.value === ageRange[5]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD08';
    }
    else if (prop === ageRange[6] && maleageselect.value === ageRange[6]) {
            code = 'ACS_13_5YR_B01001_with_ann_HD01_VD09';
    }
    else if (prop === ageRange[7] && maleageselect.value === ageRange[7]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD10';
    }
    else if (prop === ageRange[8] && maleageselect.value === ageRange[8]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD11';
    }
    else if (prop === ageRange[9] && maleageselect.value === ageRange[9]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD12';
    }
    else if (prop === ageRange[10] && maleageselect.value === ageRange[10]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD13';
    }
    else if (prop === ageRange[11] && maleageselect.value === ageRange[11]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD14';
    }
    else if (prop === ageRange[12] && maleageselect.value === ageRange[12]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD15';
    }
    else if (prop === ageRange[13] && maleageselect.value === ageRange[13]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD16';
    }
    else if (prop === ageRange[14] && maleageselect.value === ageRange[14]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD17';
    }
    else if (prop === ageRange[15] && maleageselect.value === ageRange[15]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD18';
    }
    else if (prop === ageRange[16] && maleageselect.value === ageRange[16]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD19';
    }
    else if (prop === ageRange[17] && maleageselect.value === ageRange[17]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD20';
    }
    else if (prop === ageRange[18] && maleageselect.value === ageRange[18]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD21';
    }
    else if (prop === ageRange[19] && maleageselect.value === ageRange[19]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD22';
    }
    else if (prop === ageRange[20] && maleageselect.value === ageRange[20]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD23';
    }
    else if (prop === ageRange[21] && maleageselect.value === ageRange[21]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD24';
    }
    else if (prop === ageRange[22] && maleageselect.value === ageRange[22]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD25';
    }
    //END Male if statements

    //BEGIN Femail if statements

    else if (prop === ageRange[0] && femaleageselect.value === ageRange[0]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD27';
    }
    else if (prop === ageRange[1] && femaleageselect.value === ageRange[1]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD28';
    }
    else if (prop === ageRange[2] && femaleageselect.value === ageRange[2]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD29';
    }
    else if (prop === ageRange[3] && femaleageselect.value === ageRange[3]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD30';
    }
    else if (prop === ageRange[4] && femaleageselect.value === ageRange[4]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD31';
    }
    else if (prop === ageRange[5] && femaleageselect.value === ageRange[5]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD32';
    }
    else if (prop === ageRange[6] && femaleageselect.value === ageRange[6]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD33';
    }
    else if (prop === ageRange[7] && femaleageselect.value === ageRange[7]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD34';
    }
    else if (prop === ageRange[8] && femaleageselect.value === ageRange[8]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD35';
    }
    else if (prop === ageRange[9] && femaleageselect.value === ageRange[9]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD36';
    }
    else if (prop === ageRange[10] && femaleageselect.value === ageRange[10]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD37';
    }
    else if (prop === ageRange[11] && femaleageselect.value === ageRange[11]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD38';
    }
    else if (prop === ageRange[12] && femaleageselect.value === ageRange[12]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD39';
    }
    else if (prop === ageRange[13] && femaleageselect.value === ageRange[13]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD40';
    }
    else if (prop === ageRange[14] && femaleageselect.value === ageRange[14]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD41';
    }
    else if (prop === ageRange[15] && femaleageselect.value === ageRange[15]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD42';
    }
    else if (prop === ageRange[16] && femaleageselect.value === ageRange[16]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD43';
    }
    else if (prop === ageRange[17] && femaleageselect.value === ageRange[17]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD44';
    }
    else if (prop === ageRange[18] && femaleageselect.value === ageRange[18]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD45';
    }
    else if (prop === ageRange[19] && femaleageselect.value === ageRange[19]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD46';
    }
    else if (prop === ageRange[20] && femaleageselect.value === ageRange[20]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD47';
    }
    else if (prop === ageRange[21] && femaleageselect.value === ageRange[21]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD48';
    }
    else if (prop === ageRange[22] && femaleageselect.value === ageRange[22]) {
        code = 'ACS_13_5YR_B01001_with_ann_HD01_VD49';
    }

    let newCbLayer = new L.GeoJSON.AJAX(cbUrl, {
        onEachFeature: onEachFeature,
        style: function (feature) {
            return {
            fillColor: getColor(feature.properties[code]),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          };
        }
        
        }
        
    );
    //add the census tract layer to the map
    newCbLayer.addTo(map);

      }
    

  maleageselect.addEventListener('change', (e)  => restyleByFeatureProp(e.target.value))
  femaleageselect.addEventListener('change', (e)  => restyleByFeatureProp(e.target.value))

  

