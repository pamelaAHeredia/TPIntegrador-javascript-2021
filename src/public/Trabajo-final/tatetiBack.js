const short = require('shortid');
const fs = require('fs');
const jsonWins = fs.readFileSync('./winsTateti.json', 'utf-8');
const wins = JSON.parse(jsonWins);
const SalasManager = require('./shared/SalasManager');
// API BASE DE DATOS JSON
const SALAS_FILENAME = './tatetiSalas.json';
const sm = new SalasManager(SALAS_FILENAME, 'utf-8');

// UTILIDADES

module.exports = {
    crearSala: crearSalaController,
    unirseSala: unirseSalaController,
    jugarMano: jugarManoController,
    solicitarInfoSala: solicitarInfoSalaController,
    reiniciarPartida: reiniciarPartidaController,
}

// crear una sala
function crearSalaController(req, res) {
    const idUnica = short();
    const idJugadores = [short(),null];
    const progresoX = [null,null,null,null,null];
    const progresoO = [null,null,null,null];
    const intentosRestantes = 9;
    const turno = 'X';
    const nuevaSala = {
        id: idUnica,
        playersIDs: idJugadores,
        progresoDeTablero: [null,null,null,null,null,null,null,null,null],
        progresoX,
        progresoO,
        turno,
        intentosRestantes,
        finalizada: false,
        gano: false
    }

    sm.guardarSala(nuevaSala);

    const mensajeSalaCreada = {
        salaID: nuevaSala.id,
        idPlayer: idJugadores[0],
        intentosRestantes: nuevaSala.intentosRestantes,
        progresoDeTablero: nuevaSala.progresoDeTablero,
        error: false,
        mensaje: "Sala creada con exito, esperando por un adversario...",
        finalizada: false,
        turno,
    }

    res.status(200).json(mensajeSalaCreada);
}


function unirseSalaController(req,res){
    const salaID = req.params.salaId;
    const sala = sm.findSala(salaID);
    console.log(sala)
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada"})
        return;
    }
    console.log("AAAA", sala.playersIDs);
    if (!sala.playersIDs.some(id => id === null)) {
        res.status(400).json({ error: true, mensaje: "Sala llena"})
        return;
    }

    // const idJugadores = [[sala.idJugadores[0]],null];
    const playerID2 = short();
    sala.playersIDs[1] = playerID2;

    sm.modificarSalaPorId(salaID, sala);

    const MensajeJugadorUnido = {
        salaID: sala.id,
        idPlayer: playerID2,
        intentosRestantes: sala.intentosRestantes,
        progresoDeTablero: sala.progresoDeTablero,
        turno: sala.turno,
        error: false,
        mensaje: "Unido a sala con exito",
        finalizada: sala.finalizada
    }

    res.status(200).json(MensajeJugadorUnido);
}

function reiniciarPartidaController(req, res){
    const salaID = req.params.salaId;
    const sala = sm.findSala(salaID);
    console.log(sala)
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada"})
        return;
    }
   // validar que el jugador pertenezca a la sala
   if (idPlayer !== sala.playersIDs[0] && idPlayer !== sala.playersIDs[1]){
    res.status(400).json({ error: true, mensaje: "Alto ahí! Usted no pertenece a esta sala!"})
    return;
    }
    const idUnica = sala.id;
    const idJugadores = sala.playersIDs;
    const progresoX = [null,null,null,null,null];
    const progresoO = [null,null,null,null];
    const intentosRestantes = 9;
    const turno = 'X';
    const resetSala = {
        id: idUnica,
        playersIDs: idJugadores,
        progresoDeTablero: [null,null,null,null,null,null,null,null,null],
        progresoX,
        progresoO,
        turno,
        intentosRestantes,
        finalizada: false,
        gano: false
    }
    sm.modificarSalaPorId(salaID, resetSala);

    const MensajeResetSala = {
        salaID: sala.id,
        intentosRestantes: sala.intentosRestantes,
        progresoDeTablero: sala.progresoDeTablero,
        turno: sala.turno,
        error: false,
        mensaje: "Reiniciado la sala con exito",
        finalizada: sala.finalizada
    }

    res.status(200).json(MensajeResetSala);
}



function jugarManoController(req, res) {

    const salaID = req.params.salaId;
    const move = req.body.move;
    const idPlayer = req.body.idPlayer;

    // seccion de validaciones
    if (!move) {
        res.status(400).json({ error: true, mensaje: "Debes enviar una jugada válida"})
        return;
    }
    const sala = sm.findSala(salaID);
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada"})
        return;
    }
    // validar que el jugador pertenezca a la sala
    if (idPlayer !== sala.playersIDs[0] && idPlayer !== sala.playersIDs[1]){
        res.status(400).json({ error: true, mensaje: "Alto ahí! Usted no pertenece a esta sala!"})
        return;
    }

    // validar turnos
    if (sala.turno === "X") {
        if (sala.playersIDs[1] === idPlayer) {
            res.status(400).json({ error: true, mensaje: "Es el turno de X, espera tu turno"})
            return;
        }
    } else {
        if (sala.playersIDs[0] === idPlayer) {
            res.status(400).json({ error: true, mensaje: "Es el turno de O, espera tu turno"})
            return;
        }
    }

    if ((sala.turno === 'X') && (!sala.finalizada)){
        sala.progresoX.push(move);
        sala.progresoDeTablero[move] = 'X';
        sala.turno = 'O';
        sala.intentosRestantes--;
    } else{
        if ((sala.turno === 'O') && (!sala.finalizada)){
            sala.progresoO.push(move);
            sala.progresoDeTablero[move] = 'O';
            sala.turno = 'X';
            sala.intentosRestantes--;
        }
    }
    // Sala, movimiento y jugador fueron válidos, resto el contador de intentos restantes.
    
    // Movimientos iniciales del partido, X aun no ha jugado 3 casillas del tablero,
    // imposible tener ganador en este punto.
    if (sala.intentosRestantes > 5) {
        const MensajeRespondeAMovimiento = {
            salaID: salaID,
            turno: sala.turno,
            progresoDeTablero: sala.progresoDeTablero,
            intentosRestantes: sala.intentosRestantes,
            finalizada: false,
            gano: false,
            error: false,
            mensaje: `quedan ${sala.intentosRestantes} casillas libres!`
        }
        res.status(200).json(MensajeRespondeAMovimiento);
        sm.modificarSalaPorId(salaID, sala);
        return;
    }
    // Movimientos restantes < 5 y la X podría haber ganado.(por lo menos x=3moves o=2moves)
    else {
        // tengo que constatar que alguno de los jugadores en su progreso tenga una mano ganadora
        // const nuevoProgreso = procesarProgresoDePalabraConLetra(sala.tablero, sala.progresoDeTablero, move);
        // sala.progresoDeTablero = nuevoProgreso;
        //alguien ganó
        //recorre todo el json verificando si un win(mano ganadora) está incluido en el progreso del jugador
        for (x of wins){
            //gana la cruz
            let MensajeRespondeAMovimiento;
            if(incluyewin = progresoX.includes(x[0]) && progresoX.includes(x[1]) && progresoX.includes(x[2])){
                MensajeRespondeAMovimiento = {
                    progresoDeTablero: sala.progresoDeTablero,
                    intentosRestantes,
                    turno: sala.turno,
                    finalizada: true,
                    gano: true,
                    error: false,
                    mensaje: `Ha ganado X!`
                }
            //gana el circulo 
            }else if (incluyewin = progresoO.includes(x[0]) && progresoO.includes(x[1]) && progresoO.includes(x[2])){
                MensajeRespondeAMovimiento = {
                    progresoDeTablero: sala.progresoDeTablero,
                    intentosRestantes,
                    turno: sala.turno,
                    finalizada: true,
                    gano: true,
                    error: false,
                    mensaje: `Ha ganado O!`
                }
            }
            res.status(200).json(MensajeRespondeAMovimiento);
            // sm.eliminarSalaPorID(salaID);
            return;
        }
     
        //  partida empatada
        if ((sala.intentosRestantes < 1) && (sala.gano === false)){
            const MensajeRespondeAMovimiento = {
                progresoDeTablero: sala.progresoDeTablero,
                intentosRestantes: 0,
                finalizada: true,
                gano: false,
                error: false,
                mensaje: "Empate! :( no quedan casillas por llenar en el tablero"
            }
            res.status(200).json(MensajeRespondeAMovimiento);
            // sm.eliminarSalaPorID(salaID);     mal D:
            return;
        }else{
        // Movimiento intermedio del partido (nadie ganó, empató, ni perdió la partida)
        const MensajeRespondeAMovimiento = {
            progresoDeTablero: sala.progresoDeTablero,
            intentosRestantes,
            turno: sala.turno,
            finalizada: false,
            gano: false,
            error: false,
            mensaje: `quedan ${sala.intentosRestantes} casillas libres!`
        }
        res.status(200).json(MensajeRespondeAMovimiento);
        sm.modificarSalaPorId(salaID, sala);
        return;
        }
    }
}

function solicitarInfoSalaController(req, res) {
    const salaID = req.params.salaId;
    const playerId = req.query.playerId;

    if (!playerId) return res.status(400).json({ error: true, mensaje: "Debes enviar el id de un jugador en la query 'playerId'"});

    const sala = sm.findSala(salaID);

    if (!sala) return res.status(404).json({ error: true, mensaje: "Sala no encontrada"});

    if (!sala.playersIDs.some(player => player === playerId)) return res.status(401).json({ error: true, mensaje: "No eres un jugador de esta sala"});

    // validos para pedir informacion
    const MensajeInformacionPedida = {
        salaID,
        idPlayer: playerId,
        turno: sala.turno,
        progresoDeTablero: sala.progresoDeTablero,
        error: false,
        mensaje: "",
        finalizada: sala.finalizada,
        gano: sala.gano
    }

    res.status(200).json(MensajeInformacionPedida);
}