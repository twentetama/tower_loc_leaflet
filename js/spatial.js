//initiate mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiamF3YXN0cmVzcyIsImEiOiJjanBjc3cwOWIxNzVrM3Fta2R1NGZmdW12In0.ra1FXvu_TM9MmhiL7VZuqA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/satellite-streets-v9', // stylesheet location
  center: [118.0149, -2.5489], // starting position
  zoom: 3.75 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

//initiate feature on load
map.on('load', function() {

  /*var newPoints = [];
  for (i = 0; i < towerLoc.features.length; i++) {
    newPoints.push(towerLoc.features[i].geometry.coordinates);
  };
  var existPoint = turf.points(newPoints);

  /*var newDots = []
  for (i = 0; i < searchWithin.length; i++) {
    if (turf.booleanContains(circle, searchWithin[i])){
      newDots.push(searchWithin[i]);
    } else {}
  };*/

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

  var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
  });

  map.addControl(geocoder, 'top-left');

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

  //add point on Geocoder
  map.addSource('single-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [] // Notice that initially there are no features
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
  map.addSource('new-point', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  map.addLayer({
    id: 'new-point',
    type: 'circle',
    source: 'new-point',
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
var element2 = document.getElementById("info2");
var surPoints = [];



//Add feature based on latlong input
function addNewMarker (){
  //obtain data from input
  var newLat = document.getElementById('lat').value;
  var newLong = document.getElementById('lng').value;
  var newLoc = L.latLng(newLat, newLong);
  var point = turf.point([newLong, newLat]);

  //initiate surrounding tower
  var surTowCoor = [newLong, newLat];
  var radius = 25;
  var options = {steps: 100, units: 'kilometers'};
  var circle = turf.circle(surTowCoor, radius, options);
  surTows = turf.pointsWithinPolygon(towerLoc, circle);
  console.log(surTows);

  //initiate nearest tower
  nearestTower = turf.nearest(point, towerLoc)

  var distance = Math.round(nearestTower.properties.distanceToPoint);
  var radCoor = nearestTower.geometry.coordinates;
  let distanceRoad = null;
  //console.log(nearestTower);

  //add radius buffer;
  myCircle = new MapboxCircle(newLoc, 25000, {
        editable: false,
        minRadius: 1500,
        fillColor: '#29AB87'
    }).addTo(map);

  //zooming
  map.flyTo({
    center: newLoc,
    zoom: 9,
    bearing: 0,
    speed: 1,
    curve: 0.5,
    easing: function (t) {
        return t;
      }
    });

  //initiate route and distance

  $.ajax({
    method: 'GET',
    url: 'https://api.mapbox.com/directions/v5/mapbox/driving/'+newLong+','+newLat+';'+nearestTower.geometry.coordinates+'?access_token='+mapboxgl.accessToken+'&geometries=geojson',
  }).done(function(data){
    var rute = data;
    var routeGeoJSON = turf.featureCollection([turf.feature(data.routes[0].geometry)]);
    var nonRoad = data.routes[0].geometry.coordinates;
    var lastPoint = nonRoad[0];
    var noRoad1 = [lastPoint,[Number(newLong), Number(newLat)]];
    var noRoad2 = [radCoor,nonRoad[nonRoad.length-1]];
    var radiusDis = [radCoor,[Number(newLong), Number(newLat)]];
    var distanceNoRoad1 = turf.distance(lastPoint, point, {units: 'miles'});
    var distanceNoRoad2 = turf.distance(radCoor, nonRoad[nonRoad.length-1], {units: 'miles'});
    var noRoadDashed2 = turf.multiLineString([noRoad1,noRoad2]);
    var radDashed = turf.lineString(radiusDis);

    if (surTows.features.length != 0) {
      //initiate new feature
      map.getSource('route')
          .setData(routeGeoJSON);

      map.getSource('nonRoad')
          .setData(noRoadDashed2);

      map.getSource('radDis')
          .setData(radDashed);
        } else {};

    //calculate information
    let distanceRoad = Math.round(rute.routes[0].distance/1000);
    var noRoadValue1 = Math.round((distanceNoRoad1*1609.344)/1000);
    var noRoadValue2 = Math.round((distanceNoRoad2*1609.344)/1000);
    var noRoadValue = Math.round((((distanceNoRoad1*1609.344)+(distanceNoRoad2*1609.344))/1000));

    //initiate popup
    var popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h3>New Location</h3>'+'<p>Coordinate : '+newLat+', '+newLong+'</p>');

    //new location marker
    newMarker = new mapboxgl.Marker()
      .setLngLat(newLoc)
      .setPopup(popup)
      .addTo(map);

    //distance surrounding
    var numSur = [];
    for (let i = 0; i < surTows.features.length; i++) {
      numSur.push(turf.nearest(surTows.features[i].geometry.coordinates, point));
    }
    var surNum = [];
    for (let i = 0; i < numSur.length; i++) {
      surNum.push(Math.round(numSur[i].properties.distanceToPoint));
    };

    //initiate surrounding markers
    for (let i = 0; i < surTows.features.length; i++) {
      surPoints.push(surTows.features[i].geometry.coordinates);
      };

    var surLoc = turf.multiPoint(surPoints);
    console.log(surNum);

    //initiate nearest tower
    map.getSource('new-point').setData({
        type: 'FeatureCollection',
        features: [surLoc]
      });

    var textInfo=[];

    for (let i = 0; i < surTows.features.length; i++) {
      textInfo.push(surTows.features[i].properties.Lokasi+', '+surTows.features[i].properties.Teknologi+', '+surNum[i]+' km');
    };

    var ul = document.createElement('ul');
    element2.appendChild(ul);
    textInfo.forEach(function (item) {
      var li = document.createElement('li');
      ul.appendChild(li);
      li.innerHTML += item;
    });

    console.log(surTows);

    //print info on HTML
    if (surTows.features.length >= 0) {
      element.innerHTML = '<p>Anda memasukkan titik koordinat Latitude: '+newLat+', Longitude: '+newLong+'<p>'+'<p>Dalam radius 25 km terdapat '+surTows.features.length+' menara telekomunikasi<p>';
    } else {
      element.innerHTML = '<p>Anda memasukkan titik koordinat '+newLat+', '+newLong+'<p>'+'<p>Dalam radius 25 km tidak terdapat menara telekomunikasi<p>';
    }


    /*if (noRoadValue1 === 0 && noRoadValue2 === 0){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad;
    } else if (noRoadValue1 === 0 && noRoadValue2 <= 1){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance = '+noRoadValue+' km</p>';
    } else if (noRoadValue1 <= 1 && noRoadValue2 === 0){
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance = '+noRoadValue+' km</p>';
    } else {
      element.innerHTML = '<h2><b>Nearest Tower</b></h2>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km</p>'+'<p>Non road distance 1 (New location to the nearest road) = '+noRoadValue1+' km</p>'+'<p>Non road distance 2 (Existing location to the nearest road) = '+noRoadValue2+' km</p>';
    };*/


  });
};


//reset function
function reSet(){
  newMarker.remove();
  myCircle.remove();

  //remove new point
  map.getSource('new-point').setData({
      type: 'FeatureCollection',
      features: []
    });;
  map.removeLayer('new-point');
  map.addLayer({
    id: 'new-point',
    type: 'circle',
    source: 'new-point',
    paint: {
      'circle-radius': 10,
      'circle-color': '#FF0000'
    }
  });

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
  element.innerHTML = ''
  element2.innerHTML = ''

};
