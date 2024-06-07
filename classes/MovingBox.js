class MovingBox {
    constructor(id, center) {
        this.center = center;
        this.sideLength = 5;
        this.selectedSense = getRandomIntRounded(100) % 4;
        this.decisionCarrefour = 0;
        this.id = id;
        this.steps = [];
        this.isAnimating = false; // Nouveau: Indicateur pour vérifier si l'animation est en cours
    }

    async move() {
        if (this.decisionCarrefour > 3) {
            this.selectedSense = getRandomIntRounded(100) % 4;
            console.log(this.selectedSense);
        }

        const randomPoint = generateRandomCoordinate(sense[this.selectedSense], this.center.latitude, this.center.longitude);
        const nearPoint = await OSMReader.getNearestWayPointCoordinates(randomPoint);
        const nearcoordinates = nearPoint.location;

        if (this.center.latitude === nearcoordinates[1] && this.center.longitude === nearcoordinates[0]) {
            this.decisionCarrefour++;
            console.log(this.decisionCarrefour);
        } else {
            this.decisionCarrefour = 0;
        }

        this.center.latitude = nearcoordinates[1];
        this.center.longitude = nearcoordinates[0];
        console.log("centerrr", this.center);
    }

    createSquarePolygon(center) {
        const point = turf.point(center);
        const buffered = turf.buffer(point, this.sideLength / 2, { units: 'meters' });
        const bbox = turf.bbox(buffered);
        const square = turf.bboxPolygon(bbox);
        return square.geometry.coordinates;
    }

    async animate(map, access_token) {
        // Ne pas lancer une nouvelle animation si une animation est déjà en cours
        if (this.isAnimating) return;
        this.isAnimating = true;

        // setInterval(async () => {
            var arrive = generateNearbyNode(this.center, 10000);
            console.log("afficher jhd");

            try {
                var dataCoord = await OSMReader.getRouting(this.center.toArray(), arrive.toArray(), access_token);
                console.log(dataCoord.routes);
                var i = 0;
                var j = 0;
                for (const route of dataCoord.routes) {
                    for (const el of route.geometry.coordinates) {
                        if (computeDistance(this.center.toArray(), route.geometry.coordinates[j]) > 0.004) {
                            var coordArranges = generateCoordinatesBetween(this.center.toArray(), route.geometry.coordinates[j]);
                            for (const ca of coordArranges) {
                                this.center = new Node(ca[0], ca[1]);
                                await new Promise(resolve => {
                                    setTimeout(() => {
                                        resolve();
                                    }, 1);
                                });
                                this.afficherCube(map);
                            }
                        }
                        await new Promise(resolve => {
                            setTimeout(() => {
                                resolve();
                            }, 2);
                        });
                        this.afficherCube(map);
                        j++;
                    }
                    i++;
                }
            } catch (error) {
                console.error('Error getting routing data:', error);
            }
        //}
        // , 600000);
    }

    async afficherCube(map) {
        const coordinates = this.createSquarePolygon(this.center.toArray());
        const sourceId = `3d-polygon-${this.id}`;

        console.log(sourceId);

        const source = map.getSource(sourceId);
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
