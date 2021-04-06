function log(message) {
    console.log(message);
}

//ej 6
var str = "string"; 
function ejercicio6(message, ips = "ipsum"){
    log("Longitud del texto '"+message+"' :"+ message.length); 
    log("Pos donde comienza la palabra '"+ips+"' :"+message.indexOf(ips));
    log(str+" --> convetir a mayúsculas --> "+str.toUpperCase(message.substring(1, 4)));  
}  

//ej 7
const a = Math.floor(Math.random() * 5); 
const b = Math.floor(Math.random() * 5);
const c = Math.floor(Math.random() * 5); 

function ejercicio7(){
    log("potencia: ("+a+"+"+b+")"+"^"+c+"= "+Math.pow((a+b),c)); 
    log("Números: "+a+", "+b+", "+c+". El máximo es: "+Math.max(a,b,c));
}

//ej8

var dia1 = new Date();
var dia2 = new Date(1575978300000); 

function imprimirFecha(dia2){
    log("Fecha: "+dia2); 
}

function recibirFechas(f1, f2){
    f2.setFullYear(f2.getFullYear()); 
    f1 = f2.getMonth();
    imprimirFecha(f2);      
    imprimirFecha(f1);  
}

function restarFechas(f1, f2){
    var nueva = new date (f2-f1); 
    imprimirFecha(nueva); 
}

//ej 9

