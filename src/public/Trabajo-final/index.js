const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const ppt = require('./PPTLS/piedraPapelTijera.js');
const hm = require('./HangMan.js');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


app.get('/PPTLS/' , (req,res) => {
	res.sendFile(path.resolve(__dirname, 'public/PiedraPapelTijera.html'));
});

//Hangman
app.get('/HangMan/' , (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public/HangMan/HangMan.html'));
});
// Crear una sala
app.post('/HangMan/salas', hm.crearSala);
// Jugar una letra
app.patch('/hangman/salas/:salaId', hm.jugarLetra);

app.post('/PPTLS/', ppt.crearSala);
app.patch("/PPTLS/:idSala/", ppt.unirseASala);
app.post('/PPTLS/:idSala', ppt.guardarMovimiento);
app.get('/PPTLS/:idSala/:idJugador', ppt.verificarGanador);
app.patch('/PPTLS/:idSala/:idGanador', ppt.actualizarSala);
app.delete('/PPTLS/:idSala', ppt.eliminarSala);


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));