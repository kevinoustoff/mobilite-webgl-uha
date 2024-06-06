class MovingBox {
    constructor(id,center) {
        this.center = center;
        this.sideLength = 5;
        this.selectedSense = getRandomIntRounded(100) % 4;
        this.decisionCarrefour = 0;
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

    animate(map){
        
    }
}
