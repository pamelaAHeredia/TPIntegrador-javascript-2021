const short = require('shortid');
const fs = require('fs');
const path = require('path')
const SalasManager = require('../shared/salasManager');
const smp = new SalasManager(path.join(__dirname, './infoSalas.json'), 'utf-8');


module.exports = {
	crearSala: crearSala,
	unirseASala: unirseASala,
	guardarMovimiento: guardarMovimiento,
	verificarGanador: verificarGanador,
	actualizarSala: actualizarSala,
	eliminarSala: eliminarSala
};



function crearSala(mejorDe) {
	let sala = {
		id: short(),
		playerId: short(),
		movimiento: "", 
		partidaA: mejorDe,
		puntaje: 0,
		puntajeRival: 0
	};
	smp.guardarSala(sala);
	return sala;
}

function unirseASala(infoSala) {
	let sala = {
		id: infoSala.id,
		playerId: short(),
		movimiento: "",
		partidaA: infoSala.partidaA,
		puntaje: 0,
		puntajeRival: 0
	};
	smp.guardarSala(sala);
	return sala;
}

function guardarMovimiento(mov, playerId, sala) {
	sala.movimiento = mov;
	smp.modificarSalaPorPlayerId(playerId, sala);
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


function verificarGanador(idSala, idJugador) {
	let salasJson = fs.readFileSync(path.join(__dirname, './infoSalas.json'), 'utf-8');
	let salas = JSON.parse(salasJson);
	let adversario = salas.find(v => (v.id == idSala) && (v.playerId != idJugador));
	let host = salas.find(v => (v.id == idSala) && (v.playerId == idJugador));
	if (adversario == undefined || adversario.movimiento == '' || host.movimiento == '' )  
		return undefined
	else {
		let ganador;
		let resultado = posiblidades(adversario.movimiento, host.movimiento);
		if (resultado == "Ganaste")
			ganador = host.playerId
		else if (resultado == "Perdiste")
			ganador = adversario.playerId;
		return {
			movContrario: adversario.movimiento,
			movHost: host.movimiento,
			result: resultado,
			idGanador: ganador
		}
	}
} 


function actualizarSala(datosPlayer, idGanador, idJugador, result) {
	let fin = false;
	datosPlayer.movimiento = '';
	if (datosPlayer.playerId == idGanador)
		datosPlayer.puntaje++
	else if (result != "Empate")
		datosPlayer.puntajeRival++;
	if (datosPlayer.puntaje == datosPlayer.partidaA || datosPlayer.puntajeRival == datosPlayer.partidaA)
		fin = true;
	smp.modificarSalaPorPlayerId(datosPlayer.playerId, datosPlayer);
	return fin;
}   


function eliminarSala(idJugador) {
	let exito = smp.eliminarSalaPorPlayerId(idJugador)
	return exito;
} 

