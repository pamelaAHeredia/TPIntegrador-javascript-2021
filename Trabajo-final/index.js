const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
const ppt = require('./piedraPapelTijera');
const ttt = require('./backEndTateti/tatetiBack');
const hm = require ('./HangMan')
const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());
app.use(cors());

// //Piedra papel tijera lagarto spock
function verificarSala(idSala) {
	let salasJson = fs.readFileSync('./infoSalas.json','utf8');
	let salas = JSON.parse(salasJson);
	let datos = salas.find(e => e.id == idSala);
	return {
		datosSala: datos,
		todasLasSalas: salas
	}
}

app.post('/PPTLS/', (req, res) => {
	let sala = ppt.crearSala(req.body.mejorDe);
	res.status(200).json(sala);
});

app.patch("/PPTLS/:idSala/", (req, res) => {
	let datos = verificarSala(req.params.idSala);
	if (datos.datosSala != undefined) {
		let sala = ppt.unirseASala(datos.datosSala);
		res.status(200).json(sala)
	}
	else 
		res.status(400).json({error: true, mensaje: "ID de sala incorrecto"});
}); 

app.post('/PPTLS/:idSala', (req, res) => {
	let datos = verificarSala(req.params.idSala);
	if (datos.datosSala != undefined) {
		ppt.guardarMovimiento(req.body, datos.todasLasSalas);
		res.status(200).json("Movimiento guardado")
	}
	else
		res.status(400).json({error: true, mensaje: "No se encontro la sala de juego"});
});

app.get('/PPTLS/:idSala/:idJugador', (req, res) => {
	let infoPartida = ppt.verificarGanador(req.params.idSala, req.params.idJugador);
	if (infoPartida == undefined)
		res.status(200).json({wait: true})
	else if (infoPartida == true)
		res.status(200).json({fin: true})
	else
		res.status(200).json(infoPartida);
});

app.patch('/PPTLS/:idSala/:idGanador/:idJugador', (req, res) => {
	let datos = verificarSala(req.params.idSala);
	if (datos.datosSala != undefined) {
		let fin = ppt.actualizarSala(datos.todasLasSalas, req.params.idGanador, req.params.idJugador);
		res.status(200).json(fin);
	}
	else
		res.status(400).json({error: true, mensaje: "ID de sala incorrecto"});
}) 

app.delete('/PPTLS/:idSala', (req, res) => {
	ppt.eliminarSala(req.params.idSala);
	res.status(200).send("Sala eliminada");
}); 

//Ta te ti
//controllers
app.post('/tateti/salas', ttt.crearSala);
app.post('/tateti/salas/unirse/:salaId', ttt.unirseSala);
app.post('/tateti/info', ttt.solicitarInfoSala);
app.patch('/tateti/salas/:salaId',ttt.jugarMano)


//Hangman
app.get('/HangMan/' , (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public/HangMan/HangMan.html'));
});

// Crear una sala
app.post('/HangMan/salas', hm.crearSala);


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
