const short = require('shortid');
const fs = require('fs');
const SalasManager = require('./shared/SalasManager');
const sm = new SalasManager('infoSalas.json', 'utf-8');


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
		puntaje: 0
	};
	sm.guardarSala(sala);
	return sala;
}

function unirseASala(infoSala) {
	let sala = {
		id: infoSala.id,
		playerId: short(),
		movimiento: "",
		partidaA: infoSala.partidaA,
		puntaje: 0
	};
	sm.guardarSala(sala);
	return sala;
}

function guardarMovimiento(info, salas) {
	salas.forEach(id => {
		if (id.playerId == info.playerId) 
			id.movimiento = info.movimiento;
		});
	fs.writeFileSync('infoSalas.json', JSON.stringify(salas, null, 2));
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
	let salasJson = fs.readFileSync('./infoSalas.json','utf8');
	let salas = JSON.parse(salasJson);
	let adversario = salas.find(v => (v.id == idSala) && (v.playerId != idJugador));
	let host = salas.find(v => (v.id == idSala) && (v.playerId == idJugador));
	if (adversario == undefined && host == undefined) {
		let fin = true
		return fin
	}
	else if (adversario == undefined || adversario.movimiento == '' || host.movimiento == '' )  
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


function actualizarSala(salas, idGanador, idJugador) {
	let fin = false;
	salas.forEach(i => {
		if (i.playerId == idJugador) {
			i.movimiento = '';
			if (i.playerId == idGanador) {
				i.puntaje++;
				if (i.puntaje == i.partidaA) 
					fin = true;
			}
		}
	})
	fs.writeFileSync('infoSalas.json', JSON.stringify(salas, null, 2));
	return fin;
}  


function eliminarSala(idSala) {
	for (let i = 0; i < 2; i++)
		sm.eliminarSalaPorID(idSala);
} 
