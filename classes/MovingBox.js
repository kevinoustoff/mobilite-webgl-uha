class MovingBox {
    constructor(id, center) {
        this.center = center;
        this.sideLength = 5;
        this.selectedSense = getRandomIntRounded(100) % 4;
        this.decisionCarrefour = 0;
        this.id = id;
        this.steps = [];
        this.isAnimating = false; // Indicateur pour vérifier si l'animation est en cours
        this.speed = getRandomIntRounded(20); // La vitesse en kilomètres par heure

        // Convertir la vitesse en m/s
        this.speedMS = (this.speed * 1000) / 3600;

        
        this.lastPositionDate = Date.now();
    }

    async move() {
        if (this.decisionCarrefour > 3) {
            this.selectedSense = getRandomIntRounded(100) % 4;
            
        }

        const randomPoint = generateRandomCoordinate(sense[this.selectedSense], this.center.latitude, this.center.longitude);
        const nearPoint = await OSMReader.getNearestWayPointCoordinates(randomPoint);
        const nearcoordinates = nearPoint.location;

        if (this.center.latitude === nearcoordinates[1] && this.center.longitude === nearcoordinates[0]) {
            this.decisionCarrefour++;
            
        } else {
            this.decisionCarrefour = 0;
        }

        this.center.latitude = nearcoordinates[1];
        this.center.longitude = nearcoordinates[0];
        
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

        const arrive = generateNearbyNode(this.center, 10000);

        try {
            const dataCoord = await OSMReader.getRouting(this.center.toArray(), arrive.toArray(), access_token);
            

            for (const route of dataCoord.routes) {
                for (let j = 0; j < route.geometry.coordinates.length; j++) {
                    const nextPoint = route.geometry.coordinates[j];
                    let distance = computeDistance(this.center.toArray(), nextPoint); // distance en mètres

                    if (distance > 0.0001) {
                        const coordArranges = generateCoordinatesBetween(this.center.toArray(), nextPoint, 1.5*this.speedMS);
                        for (let k = 0; k < coordArranges.length; k++) {
                            const arrangedPoint = coordArranges[k];
                            const segmentDistance = k === 0 ? distance : computeDistance(coordArranges[k - 1], arrangedPoint);

                            // Calculez le temps écoulé depuis le dernier mouvement
                            const now = Date.now();
                            const timeElapsed = (now - this.lastPositionDate) / 1000; // en secondes

                            // Calculez la pause nécessaire pour ce segment
                            const pauseDuration = Math.max((segmentDistance / this.speedMS) * 1000 - timeElapsed * 1000, 0); // en millisecondes

                            this.center = new Node(arrangedPoint[0], arrangedPoint[1]);
                            this.lastPositionDate = now;
                            await new Promise(resolve => setTimeout(() => {
                                this.afficherCube(map);
                                resolve();
                            }, pauseDuration));
                        }
                    } else {
                        const now = Date.now();
                        const timeElapsed = (now - this.lastPositionDate) / 1000; // en secondes

                        const pauseDuration = Math.max((distance / this.speedMS) * 1000 - timeElapsed * 1000, 0); // en millisecondes
                        this.center = new Node(nextPoint[0], nextPoint[1]);
                        this.lastPositionDate = now;
                        await new Promise(resolve => setTimeout(() => {
                            this.afficherCube(map);
                            resolve();
                        }, pauseDuration));
                    }
                }
            }
        } catch (error) {
            console.error('Error getting routing data:', error);
        } finally {
            this.isAnimating = false;
        }
    }

    async afficherCube(map) {
        const coordinates = this.createSquarePolygon(this.center.toArray());
        const sourceId = `3d-polygon-${this.id}`;

        

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

