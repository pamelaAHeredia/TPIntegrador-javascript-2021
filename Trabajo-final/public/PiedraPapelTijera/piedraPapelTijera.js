var infoSala;
const url = "http://localhost:3000/piedraPapelTijera/piedraPapelTijera.html?idSala=";

function cargarOpciones(valorBoton, valorReal) {
	let divBotones = document.getElementById("botones");
	let text = document.createElement("h4");
	let node = document.createTextNode("Partida al mejor de...");
	text.appendChild(node);
	divBotones.appendChild(text);
	for (let i = 0; i < 3; i ++) {
		let btn = document.createElement("BUTTON");
		btn.innerHTML = valorBoton;   
		btn.id = valorReal;              
		divBotones.appendChild(btn);
		valorBoton = valorBoton + 2;
		valorReal++;
	}
}


function asignarSala() {
	const parametro = 'idSala=';
	let paramPos = window.location.search.indexOf(parametro);
	if (paramPos === -1) {
		cargarOpciones(1, 1);
		modificarBotones(true);
		document.getElementById("botones").addEventListener('click', e => {
			modificarBotones(false);
			let limite = {mejorDe: e.target.id}
			const values = {
				method: "POST",
				headers: {
					'Content-type': 'application/json'
					},
				body: JSON.stringify(limite)
			};
			fetch("/PPTLS/", values)
				.then(response => response.json())
				.then(res => {
					document.getElementById("link").value = url+res.id;
					document.getElementById("botones").remove();
					console.log(res);
					infoSala = res;
				}) 
	    setTimeout(verificarEstado, 500);
		})
	}
	else {
		let data = window.location.search.substring(paramPos + parametro.length);
		fetch("/PPTLS/" + data, {method: "PATCH"})
			.then(response => response.json())
			.then(res => {
				if (res.error) {
					throw Error(res.mensaje);	
				} else {
					console.log(res);
					infoSala = res;
					document.getElementById("link").value = url+res.id;
					}
				})
				.catch(err => {
					alert(err);
				})
			  setTimeout(verificarEstado, 500);
			}
   
   }

 function enviarEleccion(eleccion) {
	modificarBotones(true);
	infoSala.movimiento = eleccion;
	const values = {
		method: "POST",
		headers: {
			'Content-type': 'application/json'
		},
		body: JSON.stringify(infoSala)
	  	};  
	fetch("/PPTLS/" + infoSala.id, values)
		.then(response => response.json())
		.then(msj => {	
			if (msj.error) {
				throw Error(msj.mensaje);
			} else {
				let insertarADiv = document.getElementById("msj");
				insertarADiv.innerHTML = '';
				let text = document.createElement("h2");
				let node = document.createTextNode("Esperando al oponente...");
				text.appendChild(node);
				insertarADiv.appendChild(text);
 		      }
		  })
			.catch(err => {
				 alert(err);
				 })	
			}  
  


function verificarEstado() {
	fetch("/PPTLS/" + infoSala.id + "/" + infoSala.playerId, {method: "GET"})
		.then(response => response.json())
		.then(info => {
			if (info.wait) {
				setTimeout(verificarEstado, 500);
			}
			else  {
				let insertarADiv = document.getElementById("msj");
				insertarADiv.innerHTML = '';
				let text = document.createElement("h2");
				let node = document.createTextNode(info.result+"! "+info.movHost+ " VS "+ info.movContrario);
				text.appendChild(node);
				insertarADiv.appendChild(text);
				setTimeout(function() { actualizarSala(info.idGanador, info.result) }, 1000);
				}					
			});
	}

function actualizarSala(idGanador, result) {
	fetch("/PPTLS/"+result+"/"+idGanador+"/"+infoSala.playerId, {method: "PATCH"})
		.then(res => res.json())
		.then (ok => {
			modificarBotones(false);
			if (ok == false)
				setTimeout(verificarEstado, 2500)
			else {
				let insertarADiv = document.getElementById("msj");
				insertarADiv.innerHTML = '';
				let text = document.createElement("h2");
				let node = document.createTextNode("Fin de la partida,  " + result + "!!");
				text.appendChild(node);
				insertarADiv.appendChild(text);
				eliminarSala();
				
			}
		})
	}

function eliminarSala() {
	fetch("/PPTLS/"+infoSala.playerId, {method: "DELETE"})
		.then(res => res.json())
		.then(succes => {
			if (succes.error) {
				throw Error(succes.mensaje)
		  } else {
				opcionesSalida();
		      }
		})
			.catch(err => {
				alert(err);
			})
	}

function opcionesSalida() {
		let salida = document.getElementById("opcionesSalida");
		let elementA = document.createElement('a');
        let text = document.createTextNode("Ir a pagina principal   ");
        elementA.setAttribute('href', "index.html");
        elementA.appendChild(text);
        salida.appendChild(elementA);
        elementA = document.createElement('a');
        text = document.createTextNode("   Crear nueva sala");
        elementA.setAttribute('href', 'piedraPapelTijera.html')
        elementA.appendChild(text);
        salida.appendChild(elementA);
}	


function modificarBotones(accion) {
	let elems = document.getElementsByClassName("boton");
	for(let i = 0; i < elems.length; i++) 
    	elems[i].disabled = accion;		
	} 