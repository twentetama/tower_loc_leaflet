//initiate mapbox
mapboxgl.accessToken = 'pk.eyJ1IjoiamF3YXN0cmVzcyIsImEiOiJjanBjc3cwOWIxNzVrM3Fta2R1NGZmdW12In0.ra1FXvu_TM9MmhiL7VZuqA';
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/satellite-streets-v9', // stylesheet location
  center: [118.0149, -2.5489], // starting position
  zoom: 4 // starting zoom
});

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

});

var point = null;
var popup = null;
var newMarker = null;
var nearestTower = null;
var linesDashed = null;


//Add point based on latlong input
function addNewMarker (){
  var newLat = document.getElementById('lat').value;
  var newLong = document.getElementById('lng').value;
  var newLoc = L.latLng(newLat, newLong);
  var point = turf.point([newLong, newLat]);
  var nearestTower = turf.nearest(point, towerLoc);
  var distance = Math.round(nearestTower.properties.distanceToPoint);
  var radCoor = nearestTower.geometry.coordinates;
  let distanceRoad = null;
  console.log(nearestTower);

  //zooming
  map.flyTo({
    center: newLoc,
    zoom: 10,
    bearing: 0,
    speed: 1,
    curve: 0.5,
    easing: function (t) {
        return t;
      }
    });

  console.log(nearestTower);

  map.getSource('new-point').setData({
      type: 'FeatureCollection',
      features: [nearestTower]
    });

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

    //var noRoadDashed = turf.lineString(noRoad);
    var radDashed = turf.lineString(radiusDis)
    map.getSource('route')
        .setData(routeGeoJSON);

    map.getSource('nonRoad')
        .setData(noRoadDashed2);

    map.getSource('radDis')
        .setData(radDashed);

    let distanceRoad = Math.round(rute.routes[0].distance/1000);
    var noRoadValue = Math.round((((distanceNoRoad1*1609.344)+(distanceNoRoad2*1609.344))/1000));
    var multiLine = turf.multiLineString([[[0,0],[10,10]]]);

    console.log(noRoadValue);

    //popup
    var popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h3>New Location</h3>'+'<p>Coordinate : '+newLat+', '+newLong+'</p>'+'<h4>Nearest Tower</h4>'+'<p>'+nearestTower.properties.Lokasi+'</p>'+'<p>Distance (r): '+distance+' km</p>'+'<p>Distance (road network): '+distanceRoad+' km +'+noRoadValue+' km non-road</p>');
    newMarker = new mapboxgl.Marker()
      .setLngLat(newLoc)
      .setPopup(popup)
      .addTo(map);
  });
};

function reSet(){
  newMarker.remove();

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

};
