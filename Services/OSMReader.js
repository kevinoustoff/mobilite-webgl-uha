class OSMReader {
    static MAX_LATITUDE = 47.7733000
    static MAX_LONGITUDE = 7.4141000
    static MIN_LATITUDE = 47.7239000
    static MIN_LONGITUDE = 7.2793000
    constructor(fichier) {
      this.fichier = fichier;

    }

    
  
    readFile() {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', "./data/map.osm", true);
            xhr.onreadystatechange = () => {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                  resolve(xhr.responseText);
                } else {
                  reject(xhr.statusText);
                }
              }
            };
            xhr.send();
          });
    }
    readNodes() {

        console.log(this.fichier)
        
        return this.readFile()
          .then(xmlData => {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlData, 'text/xml');
    
            const nodes = xmlDoc.getElementsByTagName('node');
            const nodeList = [];
    
            for (let i = 0; i < nodes.length; i++) {
              const node = nodes[i];
              console.log(node.getAttribute("lon"))
              const nodeObj = new Node( // Assuming a Node class exists
              node.getAttribute("id"),
              node.getAttribute("lat"),
              node.getAttribute("lon")
            );;
    
              
    
              nodeList.push(nodeObj);
            }
    
            return nodeList;
          })
          .catch(error => {
            console.error('Erreur lors de la lecture du fichier :', error);
            return [];
          });
      }
    
    static async getOverPassData(){
      var url = `https://overpass-api.de/api/interpreter?data=[out:json];node(${this.MIN_LATITUDE},${this.MIN_LONGITUDE},${this.MAX_LATITUDE},${this.MAX_LONGITUDE});out;`;
      await fetch(url).then(osmData => {
         console.log(osmData.body)
      })

    }

    static async getNearestWayPointCoordinates(coordinates){
      var data = []
      var url = `https://router.project-osrm.org/nearest/v1/car/${coordinates[0]},${coordinates[1]}`;
      await fetch(url).then(response=>response.json()).then(osmData => {
         data = osmData
      })
      // console.log(data.waypoints);
      return data.waypoints[0]
    }

    static async getWayFullData(nodeIds){
        var radius = 50
        const query = `[out:json];node(id:${nodeIds.join(',')});out;`;
        const encodedQuery = encodeURIComponent(query);
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodedQuery}`;
        var data = []

        console.log(overpassUrl);
        try {
          const response = await fetch(overpassUrl);
          if (!response.ok) {
              throw new Error('Network response was not ok ' + response.statusText);
          }
          data = await response.json();
          
      } catch (error) {
          console.error('There has been a problem with your fetch operation:', error);
      }
      return data.elements;

    }

    traiterXML(xmlData, callback) {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlData, "text/xml");
  
      const nodesObjects = [];
  
      const nodes = xmlDoc.getElementsByTagName("node");
  
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeObject = new Node( // Assuming a Node class exists
          node.getAttribute("id"),
          node.getAttribute("lat"),
          node.getAttribute("lon")
        );
        nodesObjects.push(nodeObject);
      }
    }

    
  }