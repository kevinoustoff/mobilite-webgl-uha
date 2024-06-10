class MapCustom {
    constructor(accessToken, container, style = 'mapbox://styles/mapbox/light-v11', center = [0, 0], zoom = 18, pitch = 70, bearing = -17.6) {
        mapboxgl.accessToken = accessToken;
        this.center = center;
        this.cubes = [];
        this.communes = [];
        this.blinkingCommunes = {}; // To store the state of blinking communes
        this.map = new mapboxgl.Map({
            container: container,
            style: style,
            center: center,
            zoom: zoom,
            pitch: pitch,
            bearing: bearing,
            antialias: true
        });

        this.map.on('style.load', async () => {
            await this.fetchCommunesData();
            this.onStyleLoad();
        });
    }

    async fetchCommunesData() {
        try {
            var data = await OSMReader.fetchJSONCommunData(0,100);
            data.results.forEach(element => {
                this.communes.push(new Commune(element.geo_shape.geometry.coordinates, element.com_nom, element.code_insee, element.code_iris, element.num_insee));
            });
            var data = await OSMReader.fetchJSONCommunData(101,100);
            data.results.forEach(element => {
                this.communes.push(new Commune(element.geo_shape.geometry.coordinates, element.com_nom, element.code_insee, element.code_iris, element.num_insee));
            });
        } catch (error) {
            console.error("Error fetching communes data:", error);
        }
    }

    addCube(movingBox) {
        this.cubes.push(movingBox);
    }



    async blinkCommune(communeIdentifier, duration = 10000) {
        const communeLayerId = communeIdentifier;
        const originalColor = 'rgba(0, 0, 255, 0.5)'; // Couleur d'origine de la commune (bleu)
        const blinkColor = 'rgba(200, 0, 0, 0.8)'; // Couleur pour le clignotement

        const originalOpacity = 0.05
        const blinkOpacity = 0.5
    
        let visible = true;
    
        const blinkInterval = setInterval(() => {
            const fillColor = visible ? blinkColor : originalColor;
            const opacity = visible? blinkOpacity:originalOpacity;
            this.map.setPaintProperty(communeLayerId, 'fill-extrusion-color', fillColor);
            this.map.setPaintProperty(communeLayerId, 'fill-extrusion-opacity', opacity);
            visible = !visible; // Inverser la valeur de visible à chaque itération
        }, 500); // Interval de clignotement de 0.5 seconde
    
        // Arrête le clignotement après la durée spécifiée
        setTimeout(() => {
            clearInterval(blinkInterval);
            // Rétablir la couleur d'origine
            this.map.setPaintProperty(communeLayerId, 'fill-extrusion-color', originalColor);
            this.map.setPaintProperty(communeLayerId, 'fill-extrusion-opacity', originalOpacity);
        }, duration);
    }
    
      // ... (onStyleLoad method remains the same)
    
    async onStyleLoad() {
        const layers = this.map.getStyle().layers;
        const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout['text-field']).id;
        
        this.communes.forEach(element => {
            this.map.addSource(element.identifier(), {
                'type': 'geojson',
                'data': {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': element.coordinates
                    }
                }
            });

            this.map.addLayer({
                'id': element.identifier(),
                'type': 'fill-extrusion',
                'source': element.identifier(),
                'layout': {},
                'paint': {
                    'fill-extrusion-color': 'rgba(0, 0, 255, 0.5)',  // Bleu transparent
                    'fill-extrusion-opacity': 0.05, // Opacité séparée
                }
            });
            

            this.map.addLayer({
                'id': 'outline' + element.identifier(),
                'type': 'line',
                'source': element.identifier(),
                'layout': {},
                'paint': {
                    'line-color': '#000',
                    'line-width': 0.7
                }
            });
        });

        this.map.addLayer(
            {
                'id': 'add-3d-buildings',
                'source': 'composite',
                'source-layer': 'building',
                'filter': ['==', 'extrude', 'true'],
                'type': 'fill-extrusion',
                'minzoom': 15,
                'paint': {
                    'fill-extrusion-color': '#aaa',
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

        for (let i = 0; i < this.cubes.length; i++) {
            this.addCubeLayer(this.cubes[i], i);
        }
        for (let i = 0; i < this.cubes.length; i++) {
            this.cubes[i].animate(this.map,mapboxgl.accessToken);

            if(i%3 ==0 ){
                await new Promise(resolve => {
                    setTimeout(() => {
                      resolve();
                    }, 1000);
                  });
            }
            
        }

        setInterval(() => {
            const randomIndex = getRandomIntRounded(this.communes.length - 1); // Générer un index aléatoire
            this.blinkCommune(this.communes[randomIndex].identifier(), 9000); // Faire clignoter une commune aléatoire pendant 9 secondes
        }, 20000);


        
    }

    addCubeLayer(movingBox, index) {
        const coordinates = movingBox.createSquarePolygon(movingBox.center.toArray());
        const sourceId = `3d-polygon-${index}`;
        this.map.addSource(sourceId, {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'properties': {
                    'description':
                        '<strong>Mad Men Season Five Finale Watch Party</strong><p>Head to Lounge 201 (201 Massachusetts Avenue NE) Sunday for a Mad Men Season Five Finale Watch Party, complete with 60s costume contest, Mad Men trivia, and retro food and drink. 8:00-11:00 p.m. $10 general admission, $20 admission and two hour open bar.</p>'
                },
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': coordinates
                },
                'properties': {
                    'height': 10
                }
            }
        });

        

        const colors = ['#FFFF00', '#FF0000', '#00FF00', '#000000', '#0000FF'];



// Utilisation du modulo pour obtenir un index valide dans le tableau des couleurs
    let colorIndex = index % colors.length;

// Assignation de la couleur à une variable
let assignedColor = colors[colorIndex];

        this.map.addLayer({
            'id': sourceId,
            'type': 'fill-extrusion',
            'source': sourceId,
            'layout': {},
            'paint': {
                'fill-extrusion-color': assignedColor,
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.8
            }
        });

    }
}


