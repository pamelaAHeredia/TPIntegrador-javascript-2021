const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;
const ppt = require('./backEndPiedraPapelTijera/piedraPapelTijera.js');
const ttt = require('./backEndTateti/tatetiBack');
const hm = require ('./backEndHangman/hangMan');
const SalasManager = require('./shared/SalasManager');
const smp = new SalasManager(path.join(__dirname, './backEndPiedraPapelTijera/infoSalas.json'), 'utf-8');
const smHm = new SalasManager(path.join(__dirname, './backEndHangman/salasHangman.json'), 'utf-8');
const smt =  new SalasManager(path.join(__dirname, './backEndTateti/tatetiSalas.json'), 'utf-8');
app.use(express.static('public'));
app.use(express.json());

// //Piedra papel tijera lagarto spock

app.post('/PPTLS/', (req, res) => {
	let sala = ppt.crearSala(req.body.mejorDe);
	res.status(200).json(sala);
});

app.patch("/PPTLS/:idSala/", (req, res) => {
	let datos = smp.findSala(req.params.idSala);
	if (datos != undefined) {
		let sala = ppt.unirseASala(datos);
		res.status(200).json(sala)
	}
	else 
		res.status(400).json({error: true, mensaje: "ID de sala incorrecto"});
}); 

app.post('/PPTLS/:idSala', (req, res) => {
	let datos = smp.findSalaPorPlayerId(req.body.playerId);
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
	let datos = smp.findSalaPorPlayerId(req.params.idJugador);
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

app.post('/tateti/salas', (req, res) => {
    let msj = ttt.crearSala();
    res.status(200).json(msj);
});


app.post('/tateti/salas/unirse/:salaId', (req, res) => {
    const salaID = req.params.salaId;
    const sala = smt.findSala(salaID);
    if (!sala) 
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" })
    else if ((!sala.playersIDs.some(id => id === null)))
        res.status(400).json({ error: true, mensaje: "Sala llena" });
    else {
        let msj =ttt.unirseSala(sala, salaID);
        res.status(200).json(msj);
    }
});

app.post('/tateti/info', (req, res) => {
    const salaID = req.body.salaID;
    const playerId = req.body.playerID;
    const sala = smt.findSala(salaID);
    if (!playerId)
        res.status(400).json({ error: true, mensaje: "Debes enviar el id de un jugador en la query 'playerId'" });
    else if (!sala)
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" });
    else if (!sala.playersIDs.some(player => player === playerId)) 
        res.status(401).json({ error: true, mensaje: "No eres un jugador de esta sala" });
    else {
        let msj = ttt.solicitarInfoSala(salaID, playerId, sala);
        res.status(200).json(msj);
    }
});

app.patch('/tateti/salas/:salaId', (req, res) => {
    const salaID = req.params.salaId;
    const move = req.body.move;
    const idPlayer = req.body.idPlayer;
    const sala = smt.findSala(salaID);
    if (typeof move !== "number") 
        res.status(400).json({ error: true, mensaje: "Debes enviar una jugada válida" })
    else if (!sala) 
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" })
    else if ((idPlayer !== sala.playersIDs[0] && idPlayer !== sala.playersIDs[1]))
        res.status(400).json({ error: true, mensaje: "Alto ahí! Usted no pertenece a esta sala!" })
    else {
           let info = ttt.jugarMano(salaID, move, idPlayer, sala);
           if (info.error)
               res.status(400).json(info);
           else
               res.status(200).json(info)
       }
});

app.delete('/tateti/cerrar/:salaId',(req,res) => {
	const salaID = req.params.salaId;
    const sala = smt.findSala(salaID);
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada, es probable que tu rival ya la haya eliminado" })
        return;
    }else{
		smt.eliminarSalaPorID(salaID);
		res.status(200).json({ error: false, mensaje: "Sala eliminada." })
	}
});


//Hangman

app.post('/HangMan/salas', (req, res) => {
    let msj = hm.crearSala()
    res.status(200).json(msj);
})

app.patch('/HangMan/salas/:salaId', (req, res) => {
    const roomId = req.params.salaId;
    const letra = req.body.letra;
    const sala = smHm.findSala(roomId);
    if (!sala) 
        res.status(404).json({ error: true, mensaje: "Sala no encontrada"})
     else {
         let msj = hm.jugarLetra(roomId, letra, sala);
         res.status(200).json(msj);
     }
})

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
