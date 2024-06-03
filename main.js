var sideLength = 5;
var selectedSense = getRandomIntRounded(100);
var sense = ["left","right","back","forward"]
function createSquarePolygon(center, sideLength) {
        var point = turf.point(center);
        var buffered = turf.buffer(point, sideLength / 2, { units: 'meters' });
        var bbox = turf.bbox(buffered);
        var square = turf.bboxPolygon(bbox);
        return square.geometry.coordinates;
    }
mapboxgl.accessToken = 'pk.eyJ1Ijoia3RvZmZhIiwiYSI6ImNsdzBxdGphdzAzOXUya3BocGRpYTJuMm0ifQ.NBpig4fOLcjK9BzIIz1PFw';
var center = Node.generateNode()
var node = null
var movingBox


console.log( Node.generateNode())
var decisionCarrefour = 0 

const map = new mapboxgl.Map({
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: 'mapbox://styles/mapbox/light-v11',
    center: center.toArray(),
    zoom: 18,
    pitch: 70,
    bearing: -17.6,
    container: 'map',
    antialias: true
});


map.on('style.load', async() => {
    // const osmReader = new OSMReader('./data/map.osm');
    
    // console.log(osmReader.readNodes())
   //await OSMReader.getOverPassData();
    
    
    // Insert the layer beneath any symbol layer.
    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
    
    const coordinates = createSquarePolygon(center.toArray(),sideLength)



        console.log(coordinates)

        // Add a source with GeoJSON data
        map.addSource('3d-polygon', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': coordinates
                },
                'properties': {
                    'height': 10 // Height in meters
                }
            }
        });

        // Add a new fill-extrusion layer to visualize the 3D polygon
        map.addLayer({
            'id': '3d-polygon',
            'type': 'fill-extrusion',
            'source': '3d-polygon',
            'layout': {},
            'paint': {
                'fill-extrusion-color': '#0000FF',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.8
            }
        });

        

    // map.addSource('polygon', {
    //         'type': 'geojson',
    //         'data': {
    //             'type': 'Feature',
    //             'geometry': {
    //                 'type': 'Polygon',
    //                 'coordinates': coordinates
    //             }
    //         }
    //     });

    //     // Add a new layer to visualize the polygon
    //     map.addLayer({
    //         'id': 'polygon',
    //         'type': 'fill',
    //         'source': 'polygon',
    //         'layout': {},
    //         'paint': {
    //             'fill-color': '#888888',
    //             'fill-opacity': 0.4
    //         }
    //     });

    //     // Add a black outline around the polygon
    //     map.addLayer({
    //         'id': 'outline',
    //         'type': 'fill-extrusion',
    //         'source': 'polygon',
    //         'layout': {},
    //         'paint': {
    //             'line-color': '#000',
    //             'line-width': 2
    //         }
    //     });

    // The 'building' layer in the Mapbox Streets
    // vector tileset contains building height data
    // from OpenStreetMap.
    map.addLayer(
        {
            'id': 'add-3d-buildings',
            'source': 'composite',
            'source-layer': 'building',
            'filter': ['==', 'extrude', 'true'],
            'type': 'fill-extrusion',
            'minzoom': 15,
            'paint': {
                'fill-extrusion-color': '#aaa',

                // Use an 'interpolate' expression to
                // add a smooth transition effect to
                // the buildings as the user zooms in.
                'fill-extrusion-height': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'height']
                ],
                'fill-extrusion-base': [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    15,
                    0,
                    15.05,
                    ['get', 'min_height']
                ],
                'fill-extrusion-opacity': 0.6
            }
        },
        labelLayerId
    );

    let angle = 0;
   
    

    setInterval( async ()=>{
        var randomPoint


        if (decisionCarrefour > 3){
           selectedSense =  getRandomIntRounded(100)%4

           console.log(selectedSense)
        } 
        
        randomPoint = generateRandomCoordinate(sense[selectedSense],center.latitude, center.longitude);
        

        
        var nearPoint = await OSMReader.getNearestWayPointCoordinates(randomPoint) 
        var nearcoordinates = nearPoint.location;


                    if(center.latitude == nearcoordinates[1] && center.longitude == nearcoordinates[0] ){
                        decisionCarrefour++
                        console.log(decisionCarrefour)
                    } else{
                        decisionCarrefour =0
                    }

                    
                    center.latitude = nearcoordinates[1]
                    center.longitude = nearcoordinates[0]
                    console.log("centerrr",center)
                     
               // }
                console.log("centerrr",center)
               

            
            //await new Promise(resolve => setTimeout(resolve, 1000))
            await requestAnimationFrame(animateCube);

        //    }
        // }
        
        
    }, 800);

});

function generateRandomCoordinate(direction,centerLat, centerLon) {
    const radius = 0.1/ 111300; // 5 mètres convertis en degrés de latitude/longitude (environ 1 degré = 111300 mètres)
    switch (direction) {
        case 'left': // À gauche
            angle = Math.PI / 2;
            break;
        case 'right': // À droite
            angle = 3 * Math.PI / 2;
            break;
        case 'back': // Derrière
            angle = Math.PI;
            break;
        case 'forward': // Devant
        default:
            angle = 0;
            break;
    }
    // Calcul des ajustements pour la latitude et la longitude
    const deltaLat = radius * Math.cos(angle);
    const deltaLon = radius * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180); // Correction de la longitude en fonction de la latitude

    // Nouvelles coordonnées
    const newLat = centerLat + deltaLat * 180 / Math.PI;
    const newLon = centerLon + deltaLon * 180 / Math.PI;

    return [newLon, newLat];
}

function getRandomIntRounded(max) {
    return Math.round(Math.random() * max);
}

async function animateCube() {
    
    
    var coordinates = createSquarePolygon(center.toArray(), sideLength);

    // Mettre à jour la source avec les nouvelles coordonnées
    map.getSource('3d-polygon').setData({
        'type': 'Feature',
        center: center.toArray(),
        zoom: 18,
        'geometry': {
            'type': 'Polygon',
            'coordinates': coordinates
        },
        'properties': {
            'height': 10
        }
    });
//    center = randomPoint.geometry.coordinates


   


   // Créer une nouvelle géométrie pour le cube
    

}