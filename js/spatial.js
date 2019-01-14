//initiate mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiamF3YXN0cmVzcyIsImEiOiJjanBjc3cwOWIxNzVrM3Fta2R1NGZmdW12In0.ra1FXvu_TM9MmhiL7VZuqA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/satellite-streets-v9', // stylesheet location
  center: [118.0149, -2.5489], // starting position
  zoom: 3.75 // starting zoom
});

//filtering geoJSON
let nonVsat = {
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

  "features":[]
};

let vsat = {
  "type": "FeatureCollection",
  "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },

  "features":[]
}
for (let i = 0; i < towerLoc.features.length; i++) {
  if (towerLoc.features[i].properties.Teknologi != 'VSAT'){
    nonVsat.features.push(towerLoc.features[i]);
  } else {
    vsat.features.push(towerLoc.features[i]);
  }
};

console.log(nonVsat);
console.log(vsat);
console.log(towerLoc);

map.addControl(new mapboxgl.NavigationControl());

//initiate feature on load
map.on('load', function() {
  //setting geoJSON in the map
  map.addLayer({
    id: 'towers',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: towerLoc
    },
    layout: {
      'icon-image': 'hospital-15'
    },
    paint: { }
  });

  //initiate geocoder
  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
  });

  map.addControl(geocoder, 'top-left');

  //add point on Geocoder
  map.addSource('single-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [] // initially state
    }
  });
  map.addLayer({
    id: 'point',
    source: 'single-point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#007cbf',
      'circle-stroke-width': 3,
      'circle-stroke-color': '#fff'
    }
  });
  geocoder.on('result', function(ev) {
    var searchResult = ev.result.geometry;
    console.log(searchResult);
    map.getSource('single-point').setData(searchResult);
  });

  //setting popup on each geoJSON icon
  var popup = new mapboxgl.Popup();
  map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['towers'] });
    if (!features.length) {
      popup.remove();
      return;
    }
    var feature = features[0];
    var kordinat = feature.geometry.coordinates;
    var technology = feature.properties.Teknologi;
    var tempat = feature.properties.Lokasi

    popup.setLngLat(feature.geometry.coordinates)
    .setHTML('<h3>'+tempat+'</h3>'+'<p>'+technology+'</p>'+'<p>'+kordinat+'</p>')
    .addTo(map);

    map.getCanvas().style.cursor = features.length ? 'pointer' : '';
  });

  //set existing tower
  map.setLayoutProperty('towers', 'visibility', 'none');
  var clickState = 0;
  var btn = document.querySelector('.button-elem');
  btn.addEventListener('click', function(){
    if (clickState == 0) {
      // code snippet 1
      map.setLayoutProperty('towers', 'visibility', 'visible');
      clickState = 1;
    } else {
      // code snippet 2
      map.setLayoutProperty('towers', 'visibility', 'none');
      clickState = 0;
    }
  });

  //container for new location
  map.addSource('location-VSAT', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'location-VSAT',
    type: 'circle',
    source: 'location-VSAT',
    paint: {
      'circle-radius': 10,
      'circle-color': '#0000FF'
    }
  });

  //container for new location
  map.addSource('location-NonVSAT', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'location-NonVSAT',
    type: 'circle',
    source: 'location-NonVSAT',
    paint: {
      'circle-radius': 10,
      'circle-color': '#FF0000'
    }
  });

  //container for route
  map.addSource('route', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 3,
    }
  }, 'waterway-label');

  //container for non road
  map.addSource('nonRoad', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'nonRoad',
    type: 'line',
    source: 'nonRoad',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 3,
      'line-dasharray': [1, 2],
    }
  });

  //container for radius distance
  map.addSource('radDis', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'radDis',
    type: 'line',
    source: 'radDis',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#D3D3D3',
      'line-width': 3,
      'line-dasharray': [1, 2],
    }
  });

  //container for buffer
  map.addSource('buffer', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'data',
    type: 'circle',
    source: 'buffer',
    paint: {
      'circle-color': '#00b7bf',
      'circle-stroke-width': 1,
      'circle-stroke-color': '#333',
      'circle-radius':1000
   },
  });

});

//initiate variable
var point = null;
var popup = null;
var newMarker = null;
var myCircle = null;
var surTows = null;
var nearestTower = null;
var linesDashed = null;
var element = document.getElementById("info");
var element2 = document.getElementById("info2")
var element3 = document.getElementById("info3");
var element4 = document.getElementById("info4");
var element5 = document.getElementById("info5");

//drawing function
function draw(name,feature){
  map.getSource(name).setData({
      type: 'FeatureCollection',
      features: [feature]
    });
};

function removePoints(name){
  map.getSource(name).setData({
      type: 'FeatureCollection',
      features: []
    });;
  map.removeLayer(name);
  map.addLayer({
    id: name,
    type: 'circle',
    source: name,
    paint: {
      'circle-radius': 10,
      'circle-color': '#FF0000'
    }
  });
};

//text function
function writeText(text,target) {
  let ul = document.createElement('ul');
  target.appendChild(ul);
  text.forEach(function (item) {
    let li = document.createElement('li');
    ul.appendChild(li);
    li.innerHTML += item;
  });
};

//initiate BTS class
class SurroundingTower {

  constructor (lat,lng,radius,geodata) {
    this.coordinatePoint = [lat, lng];
    this.point = turf.point([lng, lat]);
    this.radius = radius;
    this.options = {steps: 100, units: 'kilometers'};
    this.surroundedNumber = [];
    this.newLoc = L.latLng(lat, lng);
    this.circle = turf.circle(this.point, this.radius, this.options);
    this.surroundingPoints = turf.pointsWithinPolygon(geodata, this.circle);
  };

  get addPoints () {
    let surroundPoints=[];
    for (let i = 0; i < this.surroundingPoints.features.length; i++) {
      surroundPoints.push(this.surroundingPoints.features[i].geometry.coordinates);
    };
    let surroundLocation = turf.multiPoint(surroundPoints);
    return surroundLocation;
  };

  get distance (){
    var numberSurrounding = [];
    for (let i = 0; i < this.surroundingPoints.features.length; i++) {
      numberSurrounding.push(turf.nearest(this.surroundingPoints.features[i].geometry.coordinates, this.point));
    }
    var surroundedNumber = [];
    for (let i = 0; i < numberSurrounding.length; i++) {
      surroundedNumber.push(Math.round(numberSurrounding[i].properties.distanceToPoint));
    };
    return surroundedNumber;
  };

  get addText () {
    let textInfo=[];
    for (let i = 0; i < this.surroundingPoints.features.length; i++) {
      textInfo.push(this.surroundingPoints.features[i].properties.Lokasi+', '+this.surroundingPoints.features[i].properties.Teknologi+', '+this.distance[i]+' km');
    };
    return textInfo;
  };
};

//Add feature based on latlong input
function addNewMarker (){
  //obtain data from input
  newLat = document.getElementById('lat').value;
  newLong = document.getElementById('lng').value;
  let addedLoc = L.latLng(newLat, newLong);
  point = turf.point([newLong, newLat]);

  //zooming
  map.flyTo({
    center: addedLoc,
    zoom: 8.5,
    bearing: 0,
    speed: 1,
    curve: 0.5,
    easing: function (t) {
      return t;
    }
  });

  //initiate popup
  var popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML('<h3>New Location</h3>'+'<p>Coordinate : '+newLat+', '+newLong+'</p>');

  //new location marker
  newMarker = new mapboxgl.Marker()
    .setLngLat(addedLoc)
    .setPopup(popup)
    .addTo(map);

  bufferVSAT = new MapboxCircle(addedLoc, 25000, {
    editable: false,
    minRadius: 1500,
    fillColor: '#29AB87'
  }).addTo(map);

  bufferNonVsat = new MapboxCircle(addedLoc, 50000, {
    editable: false,
    minRadius: 1500,
    fillColor: '#29AB87'
  }).addTo(map);

  //initiate surrounding tower BTS
  let surroundingVSAT = new SurroundingTower(newLat,newLong,25,vsat);
  let surroundingNonVSAT = new SurroundingTower(newLat,newLong,50,nonVsat)
  draw('location-VSAT',surroundingVSAT.addPoints);
  draw('location-NonVSAT',surroundingNonVSAT.addPoints);
  writeText(surroundingVSAT.addText,element3);
  writeText(surroundingNonVSAT.addText,element5)
  console.log(surroundingNonVSAT.addPoints);
  console.log(surroundingVSAT.addPoints);


  //print info on HTML
  element.innerHTML = '<p>Anda memasukkan titik koordinat Latitude: '+newLat+', Longitude: '+newLong+'<p>';

  if (surroundingVSAT.surroundingPoints.features.length >= 1 && surroundingNonVSAT.surroundingPoints.features.length >= 1) {
    element2.innerHTML = '<p>Dalam radius 25 km terdapat '+surroundingVSAT.surroundingPoints.features.length+' menara telekomunikasi VSAT<p>';
    element4.innerHTML = '<p>Dalam radius 50 km terdapat '+surroundingNonVSAT.surroundingPoints.features.length+' menara telekomunikasi Non-VSAT<p>';
  } else if (surroundingVSAT.surroundingPoints.features.length >= 1 && surroundingNonVSAT.surroundingPoints.features.length == 0) {
    element2.innerHTML = '<p>Dalam radius 25 km terdapat '+surroundingVSAT.surroundingPoints.features.length+' menara telekomunikasi<p>';
    element4.innerHTML = '<p>Dalam radius 50 km tidak terdapat menara telekomunikasi lain';
  } else if (surroundingVSAT.surroundingPoints.features.length == 0 && surroundingNonVSAT.surroundingPoints.features.length >= 1) {
    element2.innerHTML = '<p>Dalam radius 25 km tidak terdapat menara telekomunikasi VSAT<p>';
    element4.innerHTML = '<p>Dalam radius 50 km terdapat '+surroundingNonVSAT.surroundingPoints.features.length+' menara telekomunikasi Non-VSAT<p>';
  } else {
    element2.innerHTML = '<p>Tidak terdapat menara telekomunikasi VSAT dan non-VSAT disekitar titik lokasi yang dituju<p>';
  };
};

//draw lines on click
map.on('click','new-point', function (e) {
  let coorLng = e.lngLat.lng;
  let coorLt = e.lngLat.lat;

  //initiate route and distance
  $.ajax({
    method: 'GET',
    url: 'https://api.mapbox.com/directions/v5/mapbox/driving/'+newLong+','+newLat+';'+coorLng+','+coorLt+'?access_token='+mapboxgl.accessToken+'&geometries=geojson',
  }).done(function(data){
    console.log(data);
    var rute = data;
    var routeGeoJSON = turf.featureCollection([turf.feature(data.routes[0].geometry)]);
    var nonRoad = data.routes[0].geometry.coordinates;
    var lastPoint = nonRoad[0];
    var noRoad1 = [lastPoint,[Number(newLong), Number(newLat)]];
    var noRoad2 = [[coorLng, coorLt],nonRoad[nonRoad.length-1]];
    var radiusDis = [[coorLng, coorLt],[Number(newLong), Number(newLat)]];
    var distanceNoRoad1 = turf.distance(lastPoint, point, {units: 'miles'});
    var distanceNoRoad2 = turf.distance([coorLng, coorLt], nonRoad[nonRoad.length-1], {units: 'miles'});
    var noRoadDashed2 = turf.multiLineString([noRoad1,noRoad2]);
    var radDashed = turf.lineString(radiusDis);
    map.getSource('route')
        .setData(routeGeoJSON);

    map.getSource('nonRoad')
        .setData(noRoadDashed2);

    map.getSource('radDis')
        .setData(radDashed);

    /*function tes (){
    //calculate information
    let distanceRoad = Math.round(rute.routes[0].distance/1000);
    var noRoadValue1 = Math.round((distanceNoRoad1*1609.344)/1000);
    var noRoadValue2 = Math.round((distanceNoRoad2*1609.344)/1000);
    var noRoadValue = Math.round((((distanceNoRoad1*1609.344)+(distanceNoRoad2*1609.344))/1000));

    //initiate nearest tower
    map.getSource('new-point').setData({
        type: 'FeatureCollection',
        features: [surroundingLocation]
      });

    var textInfo=[];

    //print info on HTML
    if (surTows.features.length >= 0) {
      element.innerHTML = '<p>Anda memasukkan titik koordinat Latitude: '+newLat+', Longitude: '+newLong+'<p>'+'<p>Dalam radius 25 km terdapat '+surTows.features.length+' menara telekomunikasi<p>';
    } else {
      element.innerHTML = '<p>Anda memasukkan titik koordinat '+newLat+', '+newLong+'<p>'+'<p>Dalam radius 25 km tidak terdapat menara telekomunikasi<p>';
    }


    if (noRoadValue1 === 0 && noRoadValue2 === 0){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad;
    } else if (noRoadValue1 === 0 && noRoadValue2 <= 1){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance = '+noRoadValue+' km</p>';
    } else if (noRoadValue1 <= 1 && noRoadValue2 === 0){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance = '+noRoadValue+' km</p>';
    } else {
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance 1 (New location to the nearest road) = '+noRoadValue1+' km</p>'+'<p>Non road distance 2 (Existing location to the nearest road) = '+noRoadValue2+' km</p>';
    };
    };*/
  });
});

//reset function
function reSet(){
  newMarker.remove();
  bufferVSAT.remove();
  bufferNonVsat.remove();
  removePoints('location-NonVSAT');
  removePoints('location-VSAT')

  //remove route
  map.removeLayer('route');
  map.getSource('route').setData({
      type: 'FeatureCollection',
      features: []
    });;
  map.addLayer({
    id: 'route',
    type: 'line',
    source: 'route',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': {
        base: 1,
        stops: [[12, 3], [22, 12]]
      }
    }
  }, 'waterway-label');

  //remove radius distance
  map.removeLayer('radDis');
  map.getSource('radDis').setData({
      type: 'FeatureCollection',
      features: []
    });
  map.addLayer({
    id: 'radDis',
    type: 'line',
    source: 'radDis',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#D3D3D3',
      'line-width': 3,
      'line-dasharray': [1, 2],
    }
  });

  //remove radius distance
  map.removeLayer('nonRoad');
  map.getSource('nonRoad').setData({
      type: 'FeatureCollection',
      features: []
    });
  map.addLayer({
    id: 'nonRoad',
    type: 'line',
    source: 'nonRoad',
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': '#3887be',
      'line-width': 3,
      'line-dasharray': [1, 2],
    }
  });

  //erase information
  element.innerHTML = '';
  element2.innerHTML = '';
  element3.innerHTML = '';
  element4.innerHTML = '';
  element5.innerHTML = '';
};
