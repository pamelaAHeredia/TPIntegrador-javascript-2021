function log(message) {
	console.log(message);
}  

var res ="String";
function ejercicio6(message,ipsum = "ipsum") {
	log(message.length);
	log(message.indexOf(ipsum));
	log(res.toUpperCase(message.substring(1, 4)));
}

var a = Math.floor((Math.random() * 9) + 1);
var b = Math.floor((Math.random() * 9) + 1);
var c = Math.floor((Math.random() * 9) + 1);

function ejercicio7(a,b,c){
	var aux = a + b;
	log(Math.pow(aux, c));
	log(Math.max(a, b, c));
}

var dia1 = new Date();//new Date() creates a new date object with the current date and time:
var dia2 = new Date(1575978300000);

function imprimirFecha(Date){
	log(Date);
}

function ochotres(dia1,dia2){
	dia2.setFullYear(dia1.getFullYear());
	dia1.setMonth(dia2.getMonth());
	imprimirFecha(dia1);
	imprimirFecha(dia2);
}
// 4. Realice una función que reciba dos fechas como parámetro y las reste retornando una nueva fecha
// con la diferencia entre ambas.
// 5. Llame a la función antes creada e imprima en consola el resultado de la misma en días.
function ochocuatro(dia1,dia2){
	var newDate = (dia1 - dia2);
	log(Math.trunc(newDate / 86400000));
}