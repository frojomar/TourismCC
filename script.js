var house = {lat: 0.0, lng: 0.0};
var endpointCC = "http://opendata.caceres.es/sparql/";
var queryGraph = "";
var map;
var myHouse;
var type;

var InitialConfigurate=true;

//Markers
var museums_markers = [];
var museumsSelect=false;
var monuments_markers = [];
var monumentsSelect=false;
var parks_markers=[];
var parksSelect=false;
var coffees_markers=[];
var coffesSelect=false;
var restaurants_markers=[];
var restaurantsSelect=false;
var hostels_markers=[];
var hostelsSelect=false;
var selectAll=false;

//In order
var orderedMuseums = [];
var orderedMonuments = [];
var orderedParks = [];
var orderedCoffees = [];
var orderedRestaurants = [];
var orderedHostels = [];
var orderedHotels = [];


//Time
var momentoActual;


//Matrix of number of places that we recommend of a type in a hour exactly
// The order of the rows is:
//-Museos
//-Monumentos
//-Parques
//-Bares
//-Restaurantes
//-Alojamientos
var wideMatrix=[[0,0,0,0,0, /**/0,0,0,0,1,  /**/3,3,2,1,1,  /**/2,4,3,2,1,  /**/0,0,0,0], //museums
                [5,3,0,0,0, /**/0,0,0,3,5,  /**/8,10,9,7,5, /**/5,7,10,10,9,/**/8,7,6,6], //monuments
                [1,0,0,0,0, /**/0,0,0,1,1,  /**/2,2,3,3,2,  /**/3,5,6,7,6,  /**/4,3,2,1], //parks
                [5,4,4,3,2, /**/2,2,4,8,6,  /**/4,6,6,6,4,  /**/6,5,4,3,3,  /**/5,3,4,3], //coffees and bars
                [0,0,0,0,0, /**/0,1,2,3,1,  /**/0,0,0,2,4,  /**/6,4,2,0,0,  /**/4,7,5,1], //restaurants
                [3,2,1,0,0, /**/0,0,1,1,1,  /**/1,1,2,2,1,  /**/1,1,1,2,3,  /**/5,7,8,6], //accommodations
                [0,1,0,1,0, /**/2,1,0,3,4,  /**/1,0,1,0,1,  /**/0,2,1,0,3,  /**/4,0,0,1]];


function mueveReloj(){
    momentoActual = new Date()
    hora = momentoActual.getHours();
    hora = (hora < 10) ? '0' + hora : hora;
    minuto = momentoActual.getMinutes();
    minuto = (minuto < 10) ? '0' + minuto : minuto;
    segundo = momentoActual.getSeconds()
    segundo = (segundo < 10) ? '0' + segundo : segundo;

    horaImprimible = hora + " : " + minuto + " : " + segundo

    document.getElementById("reloj").innerHTML = horaImprimible

    setTimeout("mueveReloj()",1000)
}

function orderPlaces(){
    var distances = [];

    for(i=0; i<museums_markers.length; i++){
        orderedMuseums[i]= {distance: euclidianDistance(house, museums_markers[i].getPosition()), pos: i};
    }
    orderedMuseums.sort(compare);

    for(i=0; i<monuments_markers.length; i++){
        orderedMonuments[i]= {distance: euclidianDistance(house, monuments_markers[i].getPosition()), pos: i};
    }
    orderedMonuments.sort(compare);

    for(i=0; i<parks_markers.length; i++){
        orderedParks[i]= {distance: euclidianDistance(house, parks_markers[i].getPosition()), pos: i};
    }
    orderedParks.sort(compare);

    for(i=0; i<coffees_markers.length; i++){
        orderedCoffees[i]= {distance: euclidianDistance(house, coffees_markers[i].getPosition()), pos: i};
    }
    orderedCoffees.sort(compare);

    for(i=0; i<restaurants_markers.length; i++){
        orderedRestaurants[i]= {distance: euclidianDistance(house, restaurants_markers[i].getPosition()), pos: i};
    }
    orderedRestaurants.sort(compare);

    for(i=0; i<hostels_markers.length; i++){
        orderedHostels[i]= {distance: euclidianDistance(house, hostels_markers[i].getPosition()), pos: i};
    }
    orderedHostels.sort(compare);

    for(i=0; i<hotels_markers.length; i++){
        orderedHotels[i]= {distance: euclidianDistance(house, hotels_markers[i].getPosition()), pos: i};
    }
    orderedHotels.sort(compare);

}

function deleteFarAway(placesList, orderList, counter){
    var pos;
    // alert("counter:"+counter+". Lista:"+placesList.length+".Order:"+orderList.length);
    if (counter<placesList.length){ //if there are more places that the number of places that we want to conservate
        for(i=counter; i<orderList.length; i++){
            pos=orderList[i].pos;
            placesList[pos].setMap(null);
            console.log("Eliminando elemento");
        }
    }
}

function closestMarkets(placesList, orderList, counter){

    //alert("Contador:"+counter);
    var pos;
    //alert("counter:"+counter+". Lista:"+placesList.length+".Order:"+orderList.length);
    for(i=0; i<counter; i++){
        //if(i<placesList.length){
            pos=orderList[i].pos;
            placesList[pos].setMap(map);
            console.log("Poniendo elemento");
       // }
    }

}

function sortResources() {

    var counter=0;
    var hora=momentoActual.getHours();

    document.getElementById("optMuseums").checked = true;
    document.getElementById("optMonuments").checked = true;
    document.getElementById("optParks").checked = true;
    document.getElementById("optCoffees").checked = true;
    document.getElementById("optRestaurants").checked = true;
    document.getElementById("optHostels").checked = true;
    document.getElementById("optAll").checked = true;


    museumsSelect=true;
    monumentsSelect=true;
    parksSelect=true;
    coffesSelect=true;
    restaurantsSelect=true;
    hostelsSelect=true;
    selectAll=true;


    //view Museums closest of my position
    counter=wideMatrix[0][hora];
    closestMarkets(museums_markers, orderedMuseums, counter);

    //view Monuments closest of my position
    counter=wideMatrix[1][hora];
    closestMarkets(monuments_markers,orderedMonuments,counter);

    //view Parks closest of my position
    counter=wideMatrix[2][hora];
    closestMarkets(parks_markers,orderedParks,counter);

    //view Coffees and Bars closest of my position
    counter=wideMatrix[3][hora];
    closestMarkets(coffees_markers,orderedCoffees,counter);

    //view Restaurants closest of my position
    counter=wideMatrix[4][hora];
    closestMarkets(restaurants_markers,orderedRestaurants,counter);

    //view Hotels closest of my position
    counter=wideMatrix[5][hora];
    closestMarkets(hostels_markers,orderedHostels,counter);
}

function compare(a, b) {
    if (a.distance < b.distance){
        return -1;
    }
    if (a.distance >= b.distance){
        return +1;
    }
}

function euclidianDistance(place1, place2) {
    return Math.sqrt(Math.pow(parseFloat(place2.lng()) - parseFloat(place1.lng), 2) + Math.pow(parseFloat(place2.lat()) - parseFloat(place1.lat), 2));
}

function showAll(){
    if (selectAll==false) {

        if(museumsSelect==false)showMuseums();
        if(monumentsSelect==false)showMonuments();
        if(parksSelect==false)showParks();
        if(coffesSelect==false)showCoffees();
        if(restaurantsSelect==false)showRestaurants();
        if(hostelsSelect==false)showHostels();

        document.getElementById("optMuseums").checked = true;
        document.getElementById("optMonuments").checked = true;
        document.getElementById("optParks").checked = true;
        document.getElementById("optCoffees").checked = true;
        document.getElementById("optRestaurants").checked = true;
        document.getElementById("optHostels").checked = true;
        selectAll = true;
    }
    else{
        if(museumsSelect==true)showMuseums();
        if(monumentsSelect==true)showMonuments();
        if(parksSelect==true)showParks();
        if(coffesSelect==true)showCoffees();
        if(restaurantsSelect==true)showRestaurants();
        if(hostelsSelect==true)showHostels();

        document.getElementById("optMuseums").checked = false;
        document.getElementById("optMonuments").checked = false;
        document.getElementById("optParks").checked = false;
        document.getElementById("optCoffees").checked = false;
        document.getElementById("optRestaurants").checked = false;
        document.getElementById("optHostels").checked = false;
        selectAll=false;
    }
}

function newSelected(){
    if(museumsSelect && monumentsSelect && parksSelect && coffesSelect && restaurantsSelect && hostelsSelect){
        selectAll=true;
        document.getElementById("optAll").checked = true;
    }
}

function showMuseums(){
  if(museumsSelect == true){
      for(i=0; i<museums_markers.length; i++){
          museums_markers[i].setMap(null);
      }
      museumsSelect=false;
      if(selectAll==true){
          document.getElementById("optAll").checked = false;
          selectAll=false;
      }
  }
  else{
      for(i=0; i<museums_markers.length; i++){
          museums_markers[i].setMap(map);
          museums_markers[i].setClickable(true);
      }


      museumsSelect = true;
      newSelected();
  }
}

function showMonuments() {
    if(monumentsSelect == true){
        for(i=0; i<monuments_markers.length; i++){
            monuments_markers[i].setMap(null);
        }
        monumentsSelect=false;
        if(selectAll==true){
            document.getElementById("optAll").checked = false;
            selectAll=false;
        }
    }
    else{
        for(i=0; i<monuments_markers.length; i++){
            monuments_markers[i].setMap(map);
            monuments_markers[i].setClickable(true);
        }
        monumentsSelect = true;
        newSelected();
    }

}

function showParks() {
    if(parksSelect == true){
        for(i=0; i<parks_markers.length; i++){
            parks_markers[i].setMap(null);
        }
        parksSelect=false;
        if(selectAll==true){
            document.getElementById("optAll").checked = false;
            selectAll=false;
        }
    }
    else{
        for(i=0; i<parks_markers.length; i++){
            parks_markers[i].setMap(map);
            parks_markers[i].setClickable(true);
        }
        parksSelect = true;
        newSelected();
    }
}

function showCoffees(){
    if(coffesSelect == true){
        for(i=0; i<coffees_markers.length; i++){
            coffees_markers[i].setMap(null);
        }
        coffesSelect=false;
        if(selectAll==true){
            document.getElementById("optAll").checked = false;
            selectAll=false;
        }
    }
    else{
        for(i=0; i<coffees_markers.length; i++){
            coffees_markers[i].setMap(map);
            coffees_markers[i].setClickable(true);
        }
        coffesSelect = true;
        newSelected();
    }
}

function showRestaurants(){
    if(restaurantsSelect == true){
        for(i=0; i<restaurants_markers.length; i++){
            restaurants_markers[i].setMap(null);
        }
        restaurantsSelect=false;
        if(selectAll==true){
            document.getElementById("optAll").checked = false;
            selectAll=false;
        }
    }
    else{
        for(i=0; i<restaurants_markers.length; i++){
            restaurants_markers[i].setMap(map);
            restaurants_markers[i].setClickable(true);
        }
        restaurantsSelect = true;
        newSelected();
    }
}

function showHostels() {
    if(hostelsSelect == true){
        for(i=0; i<hostels_markers.length; i++){
            hostels_markers[i].setMap(null);
        }
        hostelsSelect=false;
        if(selectAll==true){
            document.getElementById("optAll").checked = false;
            selectAll=false;
        }

    }
    else{
        for(i=0; i<hostels_markers.length; i++){
            hostels_markers[i].setMap(map);
            hostels_markers[i].setClickable(true);
        }
        hostelsSelect = true;
        newSelected();
    }
}

function doQuery(type,color){
    var url = "http://opendata.caceres.es/sparql/";
    var sparqlQuery;

    if (type == "Parque") {
        sparqlQuery = "select ?label ?lat ?long where{ " +
            "?uri a om:" + type + ". " +
            "?uri foaf:name ?label. " +
            "?uri geo:lat ?lat. " +
            "?uri geo:long ?long" +
            "}";
    }
    else{
        if(type=='LodgingBusiness'){
            sparqlQuery = "select ?label ?lat ?long where{ " +
                "?uri a schema:" + type + ". " +
                "?uri rdfs:label ?label. " +
                "?uri geo:lat ?lat. " +
                "?uri geo:long ?long" +
                "}";
        }
        else{
            sparqlQuery = "select ?label ?lat ?long where{ " +
                "?uri a om:" + type + ". " +
                "?uri rdfs:label ?label. " +
                "?uri geo:lat ?lat. " +
                "?uri geo:long ?long" +
                "}";

        }
    }


    $.ajax({
        data:{"default-graph-uri":queryGraph, query:sparqlQuery, format:'json'},
        url: endpointCC,
        cache: false,
        statusCode: {
            400: function(error){
                alert("ERROR");
            }
        },
        success: function(data){
            console.log("Exito")
            processData(data,type, color);
        }
    });

}

function processData(data,type,color) {
    var bindings = data.results.bindings;
    var element;
    var i;

    //make new arrays to delete outdated information
    switch(type){
        case "Museo":
            museums_markers= new Array;
            break;
        case "Monumento":
            monuments_markers= new Array;
            break;

        case "Parque":
            parks_markers= new Array;
            break;

        case "CafeBar":
            coffees_markers= new Array;
            break;

        case "Restaurante":
            restaurants_markers= new Array;
            break;

        case "LodgingBusiness":
            hostels_markers= new Array;
            break;
    }

    //create new markets and insert in the arrays
    for (element in bindings) {
        if (bindings.hasOwnProperty(element)) {
            if (bindings[element].long != undefined) {
                var image='icons/'+color+'/11.png'

                var marker = new google.maps.Marker({
                    position: new google.maps.LatLng(bindings[element].lat.value, bindings[element].long.value),
                    //map: map,
                    icon: image,
                    title: bindings[element].label.value
                });

                google.maps.event.addListener(marker,'click', function(){
                    document.getElementById("place_Selected1").innerHTML = "Place: "+this.getTitle();
                    document.getElementById("place_Selected2").innerHTML = "Latitude: "+this.getPosition().lat();
                    document.getElementById("place_Selected3").innerHTML = "Longitude: "+this.getPosition().lng();
                    calcRoute(this);
                });

                switch(type){
                    case "Museo":
                        museums_markers.push(marker);
                        break;
                    case "Monumento":
                        monuments_markers.push(marker);
                        break;

                    case "Parque":
                        parks_markers.push(marker);
                        break;

                    case "CafeBar":
                        coffees_markers.push(marker);
                        break;

                    case "Restaurante":
                        restaurants_markers.push(marker);
                        break;

                    case "LodgingBusiness":
                        hostels_markers.push(marker);
                        break;
                }

            }
        }
    }

    //order the array of the place that we are consulted in this iteration
    switch(type) {

        case "Museo":
            for(i = 0;i < museums_markers.length;i++){
                orderedMuseums[i] = {distance: euclidianDistance(house, museums_markers[i].getPosition()), pos: i};
            }
            orderedMuseums.sort(compare);
            break;

        case "Monumento":
            for (i = 0; i < monuments_markers.length; i++) {
                orderedMonuments[i] = {distance: euclidianDistance(house, monuments_markers[i].getPosition()), pos: i};
            }
            orderedMonuments.sort(compare);
            break;

        case "Parque":
            for (i = 0; i < parks_markers.length; i++) {
                orderedParks[i] = {distance: euclidianDistance(house, parks_markers[i].getPosition()), pos: i};
            }
            orderedParks.sort(compare);
            break;

        case "CafeBar":
            for (i = 0; i < coffees_markers.length; i++) {
                orderedCoffees[i] = {distance: euclidianDistance(house, coffees_markers[i].getPosition()), pos: i};
            }
            orderedCoffees.sort(compare);
            break;

        case "Restaurante":
            for (i = 0; i < restaurants_markers.length; i++) {
                orderedRestaurants[i] = {
                    distance: euclidianDistance(house, restaurants_markers[i].getPosition()),
                    pos: i
                };
            }
            orderedRestaurants.sort(compare);
            break;

        case "LodgingBusiness":
            for (i = 0; i < hostels_markers.length; i++) {
                orderedHostels[i] = {distance: euclidianDistance(house, hostels_markers[i].getPosition()), pos: i};
            }
            orderedHostels.sort(compare);
            break;

    }
}


function getPosition() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(function (posicion) {
            house.lat = posicion.coords.latitude;
            house.lng = posicion.coords.longitude;
        }, function (error) {
            alert("Autoriza. Error: " + error.code + " " + error.message);
        }, {enableHighAccuracy: true})
    }else{
        alert("Geolocation is not avalaible")
    }

}

function refreshPosition(){
    var oldPosition=house;

    getPosition();

    if((house.lng!=oldPosition.lng)||(house.lat!=oldPosition.lat)) {
        myHouse.setMap(null);

        var image = 'icons/Black/4.png';

        myHouse = new google.maps.Marker({
            position: new google.maps.LatLng(house.lat, house.lng),
            map: map,
            icon: image
        })
        loadData();
    }

    setTimeout("refreshPosition()",5000);
}

function loadData(){

    doQuery("Museo","Yellow");

    doQuery("Monumento","Blue");

    doQuery("Parque","Red");

    doQuery("CafeBar","Lime");

    doQuery("Restaurante","Orange");

    doQuery("LodgingBusiness","Purple");

}


function initMap() {
    loadData();
    getPosition();
    mueveReloj();

    document.getElementById("place_Selected1").innerHTML = "Place: ";
    document.getElementById("place_Selected2").innerHTML = "Latitude: ";
    document.getElementById("place_Selected3").innerHTML = "Longitude: ";

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: new google.maps.LatLng(house.lat, house.lng)
    });

    directionsMap();
    var image = 'icons/Black/4.png';

    myHouse = new google.maps.Marker({
        position: new google.maps.LatLng(house.lat, house.lng),
        map: map,
        icon: image
    })

    setTimeout("refreshPosition()",5000);
}

function directionsMap(){
    directionsDisplay = new google.maps.DirectionsRenderer;
    directionsService = new google.maps.DirectionsService;
}

function calcRoute(punto) {
    directionsDisplay.setMap(map);
    //directionsDisplay.setPanel(document.getElementById('map_directions'));

    console.log("calcRoute ran")
    var request = {
        origin: house,
        destination: punto.getPosition(),
        travelMode: google.maps.DirectionsTravelMode.TRANSIT,

    };
    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
            console.log("Respuesta correcta")
        }else{
            console.log("Error en directions service");
        }
    });
}

function clearMap() {
    directionsDisplay.setMap(null);
    directionsDisplay.setPanel(null);

    document.getElementById("place_Selected1").innerHTML = "Place: ";
    document.getElementById("place_Selected2").innerHTML = "Latitude: ";
    document.getElementById("place_Selected3").innerHTML = "Longitude: ";

}
//

// var input = document.createElement('input');
// input.setAttribute('type', 'checkbox');
// input.setAttribute('id', 'option'+museums_markers.length)
// document.getElementById("form_museums").appendChild(input);
//
// var label = document.createElement('label');
// label.setAttribute('id', 'labelOption'+museums_markers.length)
// var textLabel = document.createTextNode(bindings[element].label.value);
// document.getElementById("form_museums").appendChild(label);
// document.getElementById("labelOption"+museums_markers.length).appendChild(textLabel);
// console.log(museums_markers.length) //TODO


