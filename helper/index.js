// Constants and Helper Functions
const sense = ["left", "right", "back", "forward"];

function generateRandomCoordinate(direction, centerLat, centerLon) {
    const radius = 0.1 / 111300; // 0.1 meter converted to degrees
    let angle;

    switch (direction) {
        case 'left':
            angle = Math.PI / 2;
            break;
        case 'right':
            angle = 3 * Math.PI / 2;
            break;
        case 'back':
            angle = Math.PI;
            break;
        case 'forward':
        default:
            angle = 0;
            break;
    }

    const deltaLat = radius * Math.cos(angle);
    const deltaLon = radius * Math.sin(angle) / Math.cos(centerLat * Math.PI / 180);

    const newLat = centerLat + deltaLat * 180 / Math.PI;
    const newLon = centerLon + deltaLon * 180 / Math.PI;

    return [newLon, newLat];
}

function getRandomIntRounded(max) {
    return Math.round(Math.random() * max);
}

function generateNearbyNode(centerNode, radiusInMeters) {
    const radiusInDegrees = radiusInMeters / 111300; // Convert meters to degrees
    const angle = Math.random() * 2 * Math.PI; // Random angle
    const deltaLat = radiusInDegrees * Math.cos(angle);
    const deltaLon = radiusInDegrees * Math.sin(angle) / Math.cos(centerNode.latitude * Math.PI / 180);
    
    const newLat = centerNode.latitude + deltaLat * 180 / Math.PI;
    const newLon = centerNode.longitude + deltaLon * 180 / Math.PI;

    return new Node(Number.parseFloat(newLon.toFixed(7)), Number.parseFloat(newLat.toFixed(7)));
}

function computeDistance(from,to){
    var from = turf.point(from);
    var to = turf.point(to);
    var options = { units: "kilometers" };

    return turf.distance(from, to, options);
}
// Fonction pour générer les coordonnées entre les points en fonction de la vitesse
function generateCoordinatesBetween(start, end, speedMS) {
    const startPoint = turf.point(start);
    const endPoint = turf.point(end);
    const line = turf.lineString([startPoint.geometry.coordinates, endPoint.geometry.coordinates]);

    const length = turf.length(line, { units: 'kilometers' }); // Calculer la longueur de la ligne en kilomètres

    // Calculer le nombre de segments
    const distancePerInterval = speedMS; // en mètres, puisque le temps entre les segments est de 1 seconde
    const numSegments = Math.ceil((length * 1000) / distancePerInterval); // Convertir la longueur en mètres pour le calcul

    const coordinates = [];
    for (let i = 0; i <= numSegments; i++) {
        const distanceAlongLine = (i / numSegments) * length; // Calculer la distance le long de la ligne en kilomètres
        const pointOnLine = turf.along(line, distanceAlongLine, { units: 'kilometers' });
        coordinates.push(pointOnLine.geometry.coordinates);
    }
    return coordinates;
}