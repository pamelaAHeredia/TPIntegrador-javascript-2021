let intentosRestantes = 0;
let partidaFinalizada = false;
let partidaGanada = false;
let salaID;
let playerID;

const ERROR = document.getElementById('error');
const ROOM_ID_DISPLAY = document.getElementById('room-id-display');
const TRIES_DISPLAY = document.getElementById('tries-display');
const TURN = document.getElementById('turn-display');
const BOARD = document.getElementById("tablero");

//función encargada de pedir la información al Backend de la aplicación
async function getData(URL, body = {}, method = "GET") {
    let response;
    if (method === "GET") {
        response = await fetch(URL, {
            method: method,
        })
    }
    else {
        response = await fetch(URL, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body),
        })
    }
    const data = await response.json();
    return data
}

async function requestNewRoom() {
    const nuevaSala = await getData('/tateti/salas', {}, "POST");
    if (nuevaSala.error) {
        alert(nuevaSala.mensaje);
        return
    }
    salaID = nuevaSala.salaID;
    playerID = nuevaSala.idPlayer;
    intentosRestantes = nuevaSala.intentosRestantes;
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${intentosRestantes}`;
    TURN.innerHTML = `TURNO: ${nuevaSala.turno}`;
    document.getElementById("ficha").innerHTML = 'Sos el jugador X';
    alert(nuevaSala.mensaje);
    document.getElementById("tablero").style.display = "block";
    document.getElementById("join").style.display = "block";
    document.getElementById("crearSala").disabled = true;
    document.getElementById("join").disabled = true;
}

async function joinRoomRequest() {
    let salaInputElement = document.getElementById("sala");
    document.getElementById("tablero").style.display = "block"; //inicializa el tablero en la pantalla

    if (!salaInputElement.value) {//no se ingresa nada en el input, no se puede procesar sin un valor
        alert('Ingrese un numero de sala para continuar');
        return 0;
    }
    salaID = salaInputElement.value;

    let joinsala = await getData(`/tateti/salas/unirse/${salaID}`, { salaID }, "POST");
    if (joinsala.error) {
        alert(joinsala.mensaje);
        return
    }
    playerID = joinsala.idPlayer;
    intentosRestantes = joinsala.intentosRestantes;

    alert(joinsala.mensaje);
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${intentosRestantes}`;
    TURN.innerHTML = `TURNO: ${joinsala.turno}`;
    document.getElementById("ficha").innerHTML = 'Sos el jugador O';
    console.log(joinsala);
    document.getElementById("crearSala").disabled = true;
    document.getElementById("join").disabled = true;

}
setInterval(async () => {
    await displayTime();
}, 2500);

async function displayTime() {
    if (playerID && salaID) {
        let response = await getData(`/tateti/info`, { salaID, playerID }, "POST");
        if (response.error) {
            alert(response.mensaje);
            return
        }
        TURN.innerHTML = `TURNO: ${response.turno}`;
        ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${response.salaID}`;
        TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${response.intentosRestantes}`;
        setBoardProgress(response.progresoDeTablero);
        if (response.finalizada) {
            alert(response.mensaje);
            return
        }
    }
}

async function sendMoveRequest(move) {

    const response = await getData(`/tateti/salas/${salaID}`, { move: move, idPlayer: playerID }, "PATCH")
    if (response.error) {
        alert(response.mensaje);
        move.innerHTML.disabled = false;
        return
    }
    TURN.innerHTML = `TURNO: ${response.turno}`;
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${response.salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${response.intentosRestantes}`;
    setBoardProgress(response.progresoDeTablero);
    if (response.finalizada) {
        alert(response.mensaje);
        return
    }
}

function setBoardProgress(arrayOfMoves) {
    for (i = 0; i < 9; i++) {
        document.getElementById(i).value = arrayOfMoves[i];
    }
}

function clicked(boton) {
    let seleccion = parseInt(boton.id);
    sendMoveRequest(seleccion);
}

async function requestRestart() {
    let salaid = document.getElementById("sala");
    let salaId = salaID.value;
    alert('Reseteando la sala: ', salaid);
    for (i = 0; i < 9; i++) {
        document.getElementById(i).value = "";
    }

    let resetSala = await getData(`/tateti/salas`, { salaId }, "POST");
    alert(resetSala.mensaje);
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${resetSala.salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${resetSala.intentosRestantes}`;
    TURN.innerHTML = `TURNO: ${resetSala.turno}`;
    console.log(resetSala);
}

