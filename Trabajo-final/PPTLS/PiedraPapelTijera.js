const short = require('shortid');
const fs = require('fs');
var salasJson = fs.readFileSync('./PPTLS/infoSalas.json','utf8');


module.exports = {
	crearSala: crearSala,
	unirseASala: unirseASala,
	guardarMovimiento: guardarMovimiento,
	verificarGanador: verificarGanador,
	actualizarSala: actualizarSala,
	eliminarSala: eliminarSala
};


function crearSala(req, res) {
	let sala = {
		salaId: short(),
		playerId: short(),
		movimiento: "", 
		partidaA: req.body.mejorDe,
		puntaje: 0
	};
	guardarSala(sala);
	res.send(sala);
}

function unirseASala(req, res) {
	let sala = {
		salaId: req.params.idSala,
		playerId: short(),
		movimiento: "",
		partidaA: 0,
		puntaje: 0
	};
	let infoPartida = JSON.parse(salasJson);
	let datos = infoPartida.find(e => e.salaId == sala.salaId);
	sala.partidaA = datos.partidaA;
	guardarSala(sala);
	res.send(sala);
}

function guardarSala(info) {
	let salas = JSON.parse(salasJson);
	salas.push(info);
	fs.writeFileSync('./PPTLS/infoSalas.json', JSON.stringify(salas, null, 2));
} 


function posiblidades(movOponente, movHost) {
	let result;
	if (movOponente == movHost)
		result = "Empate";
	else
		switch(movHost) {
			case "Piedra": 
				if (movOponente == "Papel" || movOponente == "Spock")
					result = "Perdiste"
				else
					result = "Ganaste";
				break;
			case "Papel": 
				if (movOponente == "Tijera" || movOponente == "Lagarto")
					result = "Perdiste"
				else
					result = "Ganaste";
				break;
			case "Tijera":
				if (movOponente == "Piedra" || movOponente == "Spock")
					result = "Perdiste"
				else
					result = "Ganaste";
				break;
			case "Spock":
				if (movOponente == "Papel" || movOponente == "Lagarto")
					result = "Perdiste"
				else
					result = "Ganaste";
				break;
			case "Lagarto":
				if (movOponente == "Piedra" || movOponente == "Tijera")
					result = "Perdiste"
				else
					result = "Ganaste";
				break;
		}
		return result;
}

function guardarMovimiento(req, res) {
	let salasJson = fs.readFileSync('./PPTLS/infoSalas.json','utf8');
	let salas = JSON.parse(salasJson);
	salas.forEach(id => {
		if (id.playerId == req.body.playerId) 
			id.movimiento = req.body.movimiento;
		});
	fs.writeFileSync('./PPTLS/infoSalas.json', JSON.stringify(salas, null, 2));
	res.send("Movimiento guardado");  
}

function verificarGanador(req, res) {
	let informacion = {movContrario: '', movHost: '', ganePerdiEmpate: '', idGanador: 0} 
	let salas = JSON.parse(salasJson);
	let adversario = salas.find(v => (v.salaId == req.params.idSala) && (v.playerId != req.params.idJugador));
	let host = salas.find(v => (v.salaId == req.params.idSala) && (v.playerId == req.params.idJugador));
	if (adversario == undefined || adversario.movimiento == '' || host.movimiento == '' ) 
		res.send(informacion);
	else {
		let resultado = posiblidades(adversario.movimiento, host.movimiento);
		informacion.movContrario = adversario.movimiento;
		informacion.movHost = host.movimiento;
		informacion.ganePerdiEmpate = resultado;
		if (resultado == "Ganaste")
			informacion.idGanador = host.playerId
		else if (resultado == "Perdiste")
			informacion.idGanador = adversario.playerId;
		res.send(informacion);
	}
}


function actualizarSala(req, res) {
	let fin = false;
	let salas = JSON.parse(salasJson);	
	salas.forEach(i => {
		if (i.salaId == req.params.idSala) {
			i.movimiento = '';
			if (i.playerId == req.params.idGanador) {
				i.puntaje++;
				if (i.puntaje == i.partidaA) {
					fin = true;
				}
			}
		}
	})
	fs.writeFileSync('/PPTLS/infoSalas.json', JSON.stringify(salas, null, 2));
	res.send(fin);
}  


function eliminarSala(req, res) {
	let salaABorrar = req.params.idSala;
	let salas = JSON.parse(salasJson);
	salas = salas.filter(each => each.salaId != req.params.idSala);
	fs.writeFileSync('/PPTLS/infoSalas.json', JSON.stringify(salas));
	res.send("Sala borrada");
} 