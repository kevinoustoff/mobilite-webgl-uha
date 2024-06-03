class MapCustom {
    constructor(accessToken, container, style = 'mapbox://styles/mapbox/light-v11', center = [0, 0], zoom = 18, pitch = 70, bearing = -17.6) {
        mapboxgl.accessToken = accessToken;
        this.center = center;
        this.cubes = [];
        this.map = new mapboxgl.Map({
            container: container,
            style: style,
            center: center,
            zoom: zoom,
            pitch: pitch,
            bearing: bearing,
            antialias: true
        });

        this.map.on('style.load', () => {
            this.onStyleLoad();
        });
    }

    addCube(movingBox) {
        this.cubes.push(movingBox);
    }

    async onStyleLoad() {
        const layers = this.map.getStyle().layers;
        const labelLayerId = layers.find((layer) => layer.type === 'symbol' && layer.layout['text-field']).id;

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

        setInterval(() => {
            this.animateCubes();
        }, 2000);
    }

    addCubeLayer(movingBox, index) {
        const coordinates = movingBox.createSquarePolygon(movingBox.center.toArray());
        const sourceId = `3d-polygon-${index}`;
        this.map.addSource(sourceId, {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    'coordinates': coordinates
                },
                'properties': {
                    'height': 10
                }
            }
        });

        this.map.addLayer({
            'id': sourceId,
            'type': 'fill-extrusion',
            'source': sourceId,
            'layout': {},
            'paint': {
                'fill-extrusion-color': '#0000FF',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.8
            }
        });
    }

    async animateCubes() {
        for (let i = 0; i < this.cubes.length; i++) {
            const movingBox = this.cubes[i];
            await movingBox.move();
            const coordinates = movingBox.createSquarePolygon(movingBox.center.toArray());

            const sourceId = `3d-polygon-${i}`;
            const source = this.map.getSource(sourceId);
            if (source) {
                source.setData({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Polygon',
                        'coordinates': coordinates
                    },
                    'properties': {
                        'height': 10
                    }
                });
            } else {
                console.error(`Source ${sourceId} not found`);
            }
        }
    }
}
