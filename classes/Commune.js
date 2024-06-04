class Commune {
    constructor(coordinates,nom,codeInsee,codeIris,numInsee){
        this.coordinates = coordinates
        this.nom = nom
        this.codeInsee = codeInsee
        this.codeIris = codeIris
        this.numInsee = numInsee
        this.timestamp = Date.now();
    }

    identifier(){
        return `${this.codeInsee}-${this.codeIris}-${this.numInsee}-${this.timestamp}`;
    }
}