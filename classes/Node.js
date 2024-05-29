
 class Node{
    constructor(latitude,longitude,uid){
        this.latitude = latitude
        this.longitude = longitude
        this.uid = uid
    }

    static maxLatitude(){
        return 47.7733000
    }

    static maxLongitude(){
        return 7.4141000
    }

    static minLatitude(){
       return 47.7239000;
    }
    static minLongitude(){
        return 7.2793000;
    }
}