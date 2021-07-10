const short = require('shortid');
const fs = require('fs');
const jsonWords = fs.readFileSync('backEndHangman/palabras.json', 'utf-8');
const palabras = JSON.parse(jsonWords);
const SalasManager = require('../shared/SalasManager.js');

// API BASE DE DATOS JSON
const SALAS_FILENAME = 'backEndHangman/salasHangman.json';
const sm = new SalasManager(SALAS_FILENAME, 'utf-8');

module.exports = {
    crearSala: crearSalaController,
    jugarLetra: jugarLetraController,
}

function obtenerPalabraRandom() {
    return palabras[Math.floor(Math.random() * palabras.length)];
}

function posicionesDeLetraEnPalabra(palabra, letra) {
    let indices = [];
    for(let i=0; i<palabra.length;i++) {
        if (palabra[i] === letra) { 
            indices.push(i);
        }
    }
    return indices;
}

function procesarProgresoDePalabraConLetra(palabra, progreso, letra) {
    let nuevoProgreso = progreso;
    for(let i=0; i<palabra.length;i++) {
        if (palabra[i] === letra) { 
            nuevoProgreso[i] = letra;
        }
    }
    return nuevoProgreso;
}

// crear una sala
function crearSalaController(req, res) {
    const idUnica = short();
    const palabraRandom = obtenerPalabraRandom();

    const palabraElegida = palabraRandom.word;
    const pistaPalabra = palabraRandom.clue; 

    const progreso = Array(palabraRandom.word.length).fill(null);
    const intentosRestantes = 6;
    const nuevaSala = {
        id: idUnica,
        palabra: palabraElegida,
        pista: pistaPalabra, 

        progresoDePalabra: progreso,
        intentosRestantes,
        finalizada: false,
        gano: false
    }

    sm.guardarSala(nuevaSala);

    const mensajeSalaCreada = {
        salaID: nuevaSala.id,
        intentosRestantes: nuevaSala.intentosRestantes,
        progresoDePalabra: nuevaSala.progresoDePalabra,
        pista: nuevaSala.pista, 
        error: false,
        mensaje: "Sala creada con exito"
    }

    res.status(200).json(mensajeSalaCreada);
}

function jugarLetraController(req, res) {
    const roomId = req.params.salaId;
    const letra = req.body.letra;
    const sala = sm.findSala(roomId);
    
    if (!sala) {
        res.status(404).json({ error: true, mensaje: "Sala no encontrada"})
        return;
    }

    const indices = posicionesDeLetraEnPalabra(sala.palabra, letra);
    // la letra no esta contenida
    if (indices.length === 0) {
        sala.intentosRestantes--;
        // perdio la partida
        if (sala.intentosRestantes < 1) {
            const MensajeRespondeALetra = {
                intentoFallido: true,
                progresoDePalabra: sala.progresoDePalabra,
                intentosRestantes: 0,
                finalizada: true,
                gano: false,
                error: false,
                mensaje: "Perdiste! :( no te quedan intentos"
            }
            res.status(200).json(MensajeRespondeALetra);
            sm.eliminarSalaPorID(roomId);
            return;
        }
        // la letra no esta contenida pero no perdio la partida
        const MensajeRespondeALetra = {
            intentoFallido: true,
            progresoDePalabra: sala.progresoDePalabra,
            intentosRestantes: sala.intentosRestantes,
            finalizada: false,
            gano: false,
            error: false,
            mensaje: `Te quedan ${sala.intentosRestantes} intentos!`
        }
        res.status(200).json(MensajeRespondeALetra);
        sm.modificarSalaPorId(roomId, sala);
        return;
    } 
    // la letra si esta contenida
    else {
        const nuevoProgreso = procesarProgresoDePalabraConLetra(sala.palabra, sala.progresoDePalabra, letra);
        sala.progresoDePalabra = nuevoProgreso;
        // gano
        if (!nuevoProgreso.some(letra => letra === null)) {
            const MensajeRespondeALetra = {
                intentoFallido: false,
                progresoDePalabra: sala.progresoDePalabra,
                intentosRestantes: sala.intentosRestantes,
                finalizada: true,
                gano: true,
                error: false,
                mensaje: `Ganaste! :D`
            }
            res.status(200).json(MensajeRespondeALetra);
            sm.eliminarSalaPorID(roomId);
            return;
        }
        // la letra esta contenida en la palabra, pero no ganó
        const MensajeRespondeALetra = {
            intentoFallido: false,
            progresoDePalabra: sala.progresoDePalabra,
            intentosRestantes: sala.intentosRestantes,
            finalizada: false,
            gano: false,
            error: false,
            mensaje: `Exito!`
        }
        res.status(200).json(MensajeRespondeALetra);
        sm.modificarSalaPorId(roomId, sala);
        return;
    }
    // hasta este punto,  sé que existe la sala y que la letra es válida
}