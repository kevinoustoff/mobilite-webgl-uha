const accessToken = 'pk.eyJ1Ijoia3RvZmZhIiwiYSI6ImNsdzBxdGphdzAzOXUya3BocGRpYTJuMm0ifQ.NBpig4fOLcjK9BzIIz1PFw';
const centerNode = Node.generateNode();
 // Define the radius within which the nodes should be generated
const mapCustom = new MapCustom(accessToken, 'map', 'mapbox://styles/mapbox/light-v11', centerNode.toArray(), 18, 70, -17.6);

const numCubes = 50; // Number of moving cubes
for (let i = 0; i < numCubes; i++) {
    //const radiusInMeters = generate; 
    var radiusInMeters = getRandomIntRounded(30)
    const nearbyNode = generateNearbyNode(centerNode, radiusInMeters);
    const movingBox = new MovingBox(i,nearbyNode);
    mapCustom.addCube(movingBox);
}
// const sample = require('./m2a_data/m2a_iris-insee.json');

