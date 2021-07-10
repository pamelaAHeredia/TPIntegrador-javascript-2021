const short = require('shortid');
const fs = require('fs');
const jsonWins = fs.readFileSync('backEndTateti/winsTateti.json', 'utf-8');
const wins = JSON.parse(jsonWins);
const SalasManager = require('../shared/SalasManager');
// API BASE DE DATOS JSON
const SALAS_FILENAME = 'backEndTateti/tatetiSalas.json';
const sm = new SalasManager(SALAS_FILENAME, 'utf-8');

// UTILIDADES
module.exports = {
    crearSala: crearSalaController,
    unirseSala: unirseSalaController,
    jugarMano: jugarManoController,
    solicitarInfoSala: solicitarInfoSalaController,
    cerrarSala: cerrarSalaController,
}

// crear una sala
function crearSalaController(req, res) {
    const idUnica = short();
    const idJugadores = [short(), null];
    const progresoX = [];
    const progresoO = [];
    const intentosRestantes = 9;
    const turno = 'X';
    const nuevaSala = {
        id: idUnica,
        playersIDs: idJugadores,
        progresoDeTablero: [null, null, null, null, null, null, null, null, null],
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
        mensaje: "Sala creada con exito, bienvenido jugador X, esperando por un adversario...",
        finalizada: false,
        turno,
    }

    res.status(200).json(mensajeSalaCreada);
}

function unirseSalaController(req, res) {
    const salaID = req.params.salaId;
    const sala = sm.findSala(salaID);
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" })
        return;
    }

    if (!sala.playersIDs.some(id => id === null)) {//si ninguno de los jugadores es null
        res.status(400).json({ error: true, mensaje: "Sala llena" })
        return;
    }
    //ya la sala fue creada, la única información faltante es el id del player 2 
    const playerID2 = short();
    sala.playersIDs[1] = playerID2;
    //se agrega la id del player 2 a la sala almacenada en el json
    sm.modificarSalaPorId(salaID, sala);
    //configura el mensaje a enviar al jugador unido a la sala preexistente 
    const mensajeJugadorUnido = {
        salaID,
        idPlayer: playerID2,
        intentosRestantes: sala.intentosRestantes,
        progresoDeTablero: sala.progresoDeTablero,
        turno: sala.turno,
        error: false,
        mensaje: "Unido a sala con exito, bienvenido jugador O!",
        finalizada: sala.finalizada,
    }
    //envía el mensaje al jugador 2 
    res.status(200).json(mensajeJugadorUnido);
}

function jugarManoController(req, res) {
    const salaID = req.params.salaId;
    const move = req.body.move;
    const idPlayer = req.body.idPlayer;

    // seccion de validaciones
    if (typeof move !== "number") {
        res.status(400).json({ error: true, mensaje: "Debes enviar una jugada válida" })
        return;
    }
    const sala = sm.findSala(salaID);

    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" })
        return;
    }
    // validar que el jugador pertenezca a la sala
    if (idPlayer !== sala.playersIDs[0] && idPlayer !== sala.playersIDs[1]) {
        res.status(400).json({ error: true, mensaje: "Alto ahí! Usted no pertenece a esta sala!" })
        return;
    }
    //valido que la posición elegida en el tablero, no haya sido seleccionada previamente por el rival.
    if (sala.progresoDeTablero[move] === null) {
        // validar turnos
        if (sala.turno === "X") {
            if (sala.playersIDs[1] === idPlayer) {
                res.status(400).json({ error: true, mensaje: "Es el turno de X, espera tu turno" })
                return;
            }
        } else {
            if (sala.playersIDs[0] === idPlayer) {
                res.status(400).json({ error: true, mensaje: "Es el turno de O, espera tu turno" })
                return;
            }
        }

        //mientras no se haya terminado la partida. 
        if ((sala.turno === 'X') && (!sala.finalizada)) {
            sala.progresoX.push(move);
            sala.progresoDeTablero[move] = 'X';
            sala.turno = 'O';
            sala.intentosRestantes--;
        } else {
            if ((sala.turno === 'O') && (!sala.finalizada)) {
                sala.progresoO.push(move);
                sala.progresoDeTablero[move] = 'O';
                sala.turno = 'X';
                sala.intentosRestantes--;
            }
        }
    } else {
        res.status(400).json({ error: true, mensaje: "Ese casillero ya no está disponible, inténtalo denuevo;" })
        return;
    }
    // Sala, movimiento y jugador fueron válidos, se restó el contador de intentos restantes.
    // Movimientos iniciales del partido, X aun no ha jugado 3 casillas del tablero,
    // imposible tener ganador en este punto.
    if (sala.intentosRestantes > 5) {
        const MensajeRespondeAMovimiento = {
            salaID: sala.id,
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
    } else {
        // Movimientos restantes < 5 y la X podría haber ganado.(por lo menos x=3moves o=2moves)    
        // tengo que constatar que alguno de los jugadores en su progreso tenga una mano ganadora
        //alguien ganó
        //recorre todo el json verificando si un win(mano ganadora) está incluido en el progreso del jugador
        for (x of wins) {
            //gana la cruz
            if (sala.progresoX.includes(x.win[0]) && sala.progresoX.includes(x.win[1]) && sala.progresoX.includes(x.win[2])) {
                const MensajeRespondeAMovimiento = {
                    salaID: sala.id,
                    progresoDeTablero: sala.progresoDeTablero,
                    intentosRestantes: sala.intentosRestantes,
                    turno: sala.turno,
                    finalizada: true,
                    gano: true,
                    error: false,
                    mensaje: `Ha ganado X!`
                }
                sala.finalizada = true;
                sm.modificarSalaPorId(salaID, sala);

                res.status(200).json(MensajeRespondeAMovimiento);
                return;
                //gana el circulo 
            } else if (sala.progresoO.includes(x.win[0]) && sala.progresoO.includes(x.win[1]) && sala.progresoO.includes(x.win[2])) {
                const MensajeRespondeAMovimiento = {
                    salaID: sala.id,
                    progresoDeTablero: sala.progresoDeTablero,
                    intentosRestantes: sala.intentosRestantes,
                    turno: sala.turno,
                    finalizada: true,
                    gano: true,
                    error: false,
                    mensaje: `Ha ganado O!`
                }
                sala.finalizada = true;
                sm.modificarSalaPorId(salaID, sala);
                res.status(200).json(MensajeRespondeAMovimiento);
                return;
            }
        }

        //  partida empatada
        if ((sala.intentosRestantes < 1) && (sala.gano == false)) {
            const MensajeRespondeAMovimiento = {
                salaID: sala.id,
                progresoDeTablero: sala.progresoDeTablero,
                intentosRestantes: 0,
                finalizada: true,
                gano: false,
                error: false,
                mensaje: "Empate! :( no quedan casillas por llenar en el tablero"
            }
            sala.finalizada = true;
            res.status(200).json(MensajeRespondeAMovimiento);
            sm.modificarSalaPorId(salaID, sala);
            return;
        } else {
            // Movimiento intermedio del partido (nadie ganó, empató, ni perdió la partida)
            const MensajeRespondeAMovimiento = {
                salaID: sala.id,
                progresoDeTablero: sala.progresoDeTablero,
                intentosRestantes: sala.intentosRestantes,
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
    const salaID = req.body.salaID;
    const playerId = req.body.playerID;

    if (!playerId) return res.status(400).json({ error: true, mensaje: "Debes enviar el id de un jugador en la query 'playerId'" });

    const sala = sm.findSala(salaID);

    if (!sala) return res.status(404).json({ error: true, mensaje: "Sala no encontrada" });

    if (!sala.playersIDs.some(player => player === playerId)) return res.status(401).json({ error: true, mensaje: "No eres un jugador de esta sala" });

    // valido para pedir informacion
    const MensajeInformacionPedida = {
        salaID,
        idPlayer: playerId,
        turno: sala.turno,
        progresoDeTablero: sala.progresoDeTablero,
        intentosRestantes: sala.intentosRestantes,
        error: false,
        mensaje: "",
        finalizada: sala.finalizada,
        gano: sala.gano
    }
    res.status(200).json(MensajeInformacionPedida);
}

function cerrarSalaController(req, res) {
    const salaID = req.params.salaId;
    const sala = sm.findSala(salaID);
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada" })
        return;
    }
    sm.eliminarSalaPorID(salaID);
    res.status(200).json({ error: false, mensaje: "Sala eliminada" })
}
