const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
const ppt = require('./backEndPPTLS/PiedraPapelTijera');
const ttt = require('./backEndTateti/tatetiBack');
const hm = require ('./backEndHangman/hangMan');
const SalasManager = require('./shared/SalasManager');
const sm = new SalasManager(path.join(__dirname, './backEndPPTLS/infoSalas.json'), 'utf-8');


app.use(express.static('public'));
app.use(express.json());

// //Piedra papel tijera lagarto spock

app.post('/PPTLS/', (req, res) => {
	let sala = ppt.crearSala(req.body.mejorDe);
	res.status(200).json(sala);
});

app.patch("/PPTLS/:idSala/", (req, res) => {
	let datos = sm.findSala(req.params.idSala);
	if (datos != undefined) {
		let sala = ppt.unirseASala(datos);
		res.status(200).json(sala)
	}
	else 
		res.status(400).json({error: true, mensaje: "ID de sala incorrecto"});
}); 

app.post('/PPTLS/:idSala', (req, res) => {
	let datos = sm.findSalaPorPlayerId(req.body.playerId);
	if (datos != undefined) {
		ppt.guardarMovimiento(req.body.movimiento, req.body.playerId, datos);
		res.status(200).json("OK")
	}
	else
		res.status(400).json({error: true, mensaje: "No se encontro la sala de juego"});
});

app.get('/PPTLS/:idSala/:idJugador', (req, res) => {
	let infoPartida = ppt.verificarGanador(req.params.idSala, req.params.idJugador);
	if (infoPartida == undefined)
		res.status(200).json({wait: true})
	else
		res.status(200).json(infoPartida);
}) 

app.patch('/PPTLS/:result/:idGanador/:idJugador', (req, res) => {
	let datos = sm.findSalaPorPlayerId(req.params.idJugador);
	let fin = ppt.actualizarSala(datos, req.params.idGanador, req.params.idJugador, req.params.result);
	res.status(200).json(fin);
}) 

app.delete('/PPTLS/:idJugador', (req, res) => {
	let exito = ppt.eliminarSala(req.params.idJugador);
	if (exito)
		res.status(200).json("Sala eliminada");
    else
    	res.status(400).json({error: true, mensaje: "No se pudo eliminar la sala"});
}); 

//Ta te ti
//controllers
app.post('/tateti/salas', ttt.crearSala);
app.post('/tateti/salas/unirse/:salaId', ttt.unirseSala);
app.post('/tateti/info', ttt.solicitarInfoSala);
app.patch('/tateti/salas/:salaId',ttt.jugarMano);
app.delete('/tateti/cerrar/:salaId',ttt.cerrarSala);

//Hangman
// Crear una sala
app.post('/HangMan/salas', hm.crearSala);
app.patch('/HangMan/salas/:salaId', hm.jugarLetra); 

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
