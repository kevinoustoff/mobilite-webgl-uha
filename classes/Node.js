class Node {
    constructor(longitude, latitude) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.uid = null;
    }

    set setUid(uid) {
        this.uid = uid;
    }

    set setLatitude(latitude) {
        this.latitude = latitude;
    }

    set setLongitude(longitude) {
        this.longitude = longitude;
    }

    set setCoordinates(coordinates) {
        this.latitude = coordinates[1];
        this.longitude = coordinates[0];
    }

    getLatitude() {
        return this.latitude;
    }

    getLongitude() {
        return this.longitude;
    }

    static generateNode() {
        const latitude = Math.random() * (Node.maxLatitude() - Node.minLatitude()) + Node.minLatitude();
        const longitude = Math.random() * (Node.maxLongitude() - Node.minLongitude()) + Node.minLongitude();
        return new Node(Number.parseFloat(longitude.toFixed(7)), Number.parseFloat(latitude.toFixed(7)));
    }

    static parse(number) {
        return Number.parseFloat(number.toFixed(7));
    }

    toArray() {
        return [this.longitude, this.latitude];
    }

    static maxLatitude() {
        return 47.7733000;
    }

    static maxLongitude() {
        return 7.4141000;
    }

    static minLatitude() {
        return 47.7239000;
    }

    static minLongitude() {
        return 7.2793000;
    }

    equals(otherNode) {
        return ((this.node.longitude === otherNode[0]) && (this.node.latitude === otherNode[1]));
    }

    static arrayToObject(nodeAsArray) {
        return new Node(nodeAsArray[0], nodeAsArray[1]);
    }
}
