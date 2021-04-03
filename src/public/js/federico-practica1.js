function log(message) {
 console.log(message);
 }


function ejercicio6(cadena) {
	log(cadena.length);
	log(cadena.indexOf("ipsum"));
	var subSTR = cadena.substring(1,4);
	log(subSTR.toUpperCase());
}


var A = Math.floor(Math.random() * 10);
var B = Math.floor(Math.random() * 10);
var C = Math.floor(Math.random() * 10);

function ejercicio7(){
	log(Math.pow((A + B), C));
	if (A > B && A > C)
		log(A)
	else if (B > A && B > C)
		log(B)
	else
		log(C)
}

var dia1 = new Date();
var dia2 = new Date(1575978300000);



function imprimirFecha(dia) {
	log(dia.getDate() + "/" + dia.getMonth() + "/" + dia.getFullYear() + " " + dia.getHours() 
		+ ":" + dia.getMinutes() + ":" + dia.getSeconds());
}

var fecha1 = new Date('01/10/2021');
var fecha2 = new Date('01/01/2021');


function intercambiarFechas (dia1, dia2) {
	dia2.setFullYear(dia1.getFullYear());
	dia1.setMonth(dia2.getMonth());
	imprimirFecha(dia1);
	imprimirFecha(dia2);
}


function restarFechas (fecha1, fecha2) {
	const diferenciaTiempo = Math.abs(fecha2 - fecha1);
	const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));
	log(diferenciaDias);
}
