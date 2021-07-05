const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;
const ppt = require('./piedraPapelTijera');
const ttt = require('./tatetiBack');
const hm = require ('./HangMan')
const cors = require('cors');

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
app.use(cors());

//Piedra papel tijera lagarto spock
app.get('/PPTLS/' , (req,res) => {
	res.sendFile(path.resolve(__dirname, 'public/PiedraPapelTijera.html'));
});



app.post('/PPTLS/', ppt.crearSala);
app.patch("/PPTLS/:idSala/", ppt.unirseASala);
app.post('/PPTLS/:idSala', ppt.guardarMovimiento);
app.get('/PPTLS/:idSala/:idJugador', ppt.verificarGanador);
app.patch('/PPTLS/:idSala/:idGanador', ppt.eliminarMov);



//Ta te ti

app.get('/tateti/' , (req,res) => {
	res.sendFile(path.resolve(__dirname, 'public/tateti/tateti.html'));
});
 //controllers
app.post('/tateti/salas', ttt.crearSala);
app.post('/tateti/salas/unirse/:salaId', ttt.unirseSala);
app.get('/tateti/salas/:salaId', ttt.solicitarInfoSala);
// guarda en .json el archivo con el tablero actual.
app.patch('/tateti/salas/:salaId',ttt.jugarMano)


//Hangman
app.get('/HangMan/' , (req, res) => {
	res.sendFile(path.resolve(__dirname, 'public/HangMan/HangMan.html'));
});

// Crear una sala
app.post('/HangMan/salas', hm.crearSala);


app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
