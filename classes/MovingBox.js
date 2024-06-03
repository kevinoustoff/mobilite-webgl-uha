class MovingBox {
    static sideLength = 5;
    static sense = ["left", "right", "back", "forward"];
    static max = 100;

    constructor(id, node,map) {
        this.node = node;
        this.id = id;
        this.decisionCarrefour = 0;
        this.selectedSense = this.getRandomIntRounded(100);
        this.speed = 0;
        this.map = map
    }

    set setNode(node){
        node = node
    }
    



    getLayerId() {
        return `3d-polygon-${this.id}`;
    }

    addLayer() {
        return {
            'id': this.getLayerId(),
            'type': 'fill-extrusion',
            'source': this.getLayerId(),
            'layout': {},
            'paint': {
                'fill-extrusion-color': '#0000FF',
                'fill-extrusion-height': ['get', 'height'],
                'fill-extrusion-base': 0,
                'fill-extrusion-opacity': 0.8
            }
        };
    }

     async run() {
        setInterval(async () => {
            var randomPoint;
            // si le cube coince changer de direction
            if (this.decisionCarrefour > 3) {
                this.selectedSense = this.getRandomIntRounded(this.max) % 4;
                console.log(this.selectedSense);
            }

            randomPoint = this.generateRandomCoordinate();
            var nearPoint = await OSMReader.getNearestWayPointCoordinates(randomPoint);
            var nearcoordinates = nearPoint.location;
            if (this.node.equals(nearcoordinates)) {
                this.decisionCarrefour++;
                console.log(this.decisionCarrefour);
            } else {
                this.decisionCarrefour = 0;
            }

            this.node.setCoordinates(nearcoordinates);

            await requestAnimationFrame(this.animateCube.bind(this));
        }, 1000);
     }

    addSource() {
        console.log(this.node.toArray());
        const coordinates = this.createSquarePolygon(this.node.toArray(), this.sideLength);

        console.log(coordinates)
        return {
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
        };
    }

    createSquarePolygon(center, sideLength) {

        var points = [];
        var angleParPoint = (2 * Math.PI) / 4;

        var rayon = 0.00002

        for (var i = 0; i < 4; i++) {
            var angle = i * angleParPoint;
            var dx = rayon * Math.cos(angle);
            var dy = rayon * Math.sin(angle);
            
            // Conversion des distances angulaires en degrés
            var deltaLongitude = dx / (111320 * Math.cos(center[1] * Math.PI / 180));
            var deltaLatitude = dy / 110540;

            var x = center[0] + deltaLongitude;
            var y = center[1] + deltaLatitude;
            
            points.push([x, y]);
        }

        // Ajouter le premier point à la fin pour fermer le polygone
        points.push(points[0]);

        return points;
    }

    generateRandomCoordinate() {
        const direction = MovingBox.sense[this.selectedSense];
        const radius = 0.1 / 111300; // 5 mètres convertis en degrés de latitude/longitude (environ 1 degré = 111300 mètres)
        let angle;
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
        console.log('node',this.node)
        const deltaLon = radius * Math.sin(angle) / Math.cos(this.node.getLatitude() * Math.PI / 180); // Correction de la longitude en fonction de la latitude

        // Nouvelles coordonnées
        const newLat = this.node.latitude + deltaLat * 180 / Math.PI;
        const newLon = this.node.getLongitude() + deltaLon * 180 / Math.PI;

        this.node.latitude = newLat;
        this.node.longitude = newLon;
    }

    getRandomIntRounded(max) {
        return Math.round(Math.random() * max);
    }

    async animateCube() {
        const coordinates = this.createSquarePolygon(this.node.toArray(), this.sideLength);

        // Mettre à jour la source avec les nouvelles coordonnées
        this.map.getSource(this.getLayerId()).setData({
            'type': 'Feature',
            center: this.node.toArray(),
            zoom: 18,
            'geometry': {
                'type': 'Polygon',
                'coordinates': coordinates
            },
            'properties': {
                'height': 10
            }
        });
    }
}
