let intentosRestantes = 0;
let partidaFinalizada = false;
let partidaGanada = false;
let ganador;
let salaID;
let playerID;

const ERROR = document.getElementById('error');
const ROOM_ID_DISPLAY = document.getElementById('room-id-display');
const ROOM_DISPLAY_DIV = document.getElementById('div1');
const ROOM_ID_DISPLAY1 = document.getElementById('room-id-display1');
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

//función para crear una nueva sala
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
    //ROOM_DISPLAY_DIV.style.style.display = "block";
    ROOM_ID_DISPLAY1.value = `${salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${intentosRestantes}`;
    TURN.innerHTML = `TURNO: ${nuevaSala.turno}`;
    document.getElementById("ficha").innerHTML = 'Sos el jugador X';
    alert(nuevaSala.mensaje);
    document.getElementById("create").style.display = "none";
    document.getElementById("tablero").style.display = "block";
    document.getElementById("div1").style.display = "block";
    document.getElementById("room-id-textBox").style.display = "block"
    // document.getElementById("join").disabled = true;
}

//función para unirse a una partida. 
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
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${intentosRestantes}`;
    TURN.innerHTML = `TURNO: ${joinsala.turno}`;
    document.getElementById("div1").style.display = "block";
    document.getElementById("ficha").innerHTML = 'Sos el jugador O';
    document.getElementById("tablero").style.display = "block";
    document.getElementById("create").style.display = "none";
    alert(joinsala.mensaje);
}

//funcion setea un intervalo en 1,5 segundos y llama a la función que consulta el estado de la partida
setInterval(async () => {
    if (!partidaFinalizada) {
        await displayTime();
    }
}, 1000);

//función consulta estado continuamente (con el intervalo seteado anteriormente)
async function displayTime() {
    if (playerID && salaID) {
        let response = await getData(`/tateti/info`, { salaID, playerID }, "POST");
        if (response.error) {
            alert(response.mensaje);
            return
        }
        if (!response.finalizada) {
            TURN.innerHTML = `TURNO: ${response.turno}`;
            ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${response.salaID}`;
            TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${response.intentosRestantes}`;
            setBoardProgress(response.progresoDeTablero);
        } else {
            partidaFinalizada = true;
            clearInterval();
            if (response.turno == 'X') {
                document.getElementById("mensajeFinal").innerHTML = 'Partido Terminado, ha ganado el O';
            } else {
                document.getElementById("mensajeFinal").innerHTML = 'Partido Terminado, ha ganado la X';
            }
            document.getElementById("mensajeFinal").style.display = "block";
            document.getElementById("tablero").style.display = "none";
            document.getElementById("div1").style.display = "none";
            document.getElementById("div2").style.display = "block";
            return;
        }
    }
}

//función envía un movimiento y un id de jugador al backend y actualiza la partida 
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

        // alert(response.mensaje);
        document.getElementById("tablero").style.visibility = "hidden";
        return
    }
}

//función que "escribe" el tablero actualizado 
function setBoardProgress(arrayOfMoves) {
    for (i = 0; i < 9; i++) {
        document.getElementById(i).value = arrayOfMoves[i];
    }
}

//función toma el "id" del casillero seleccionado 
function clicked(boton) {
    let seleccion = parseInt(boton.id);
    sendMoveRequest(seleccion);
}

//copia la id de la sala 
function copyingId() {
    let text = document.getElementById("room-id-display1").value;
    copyTextToClipboard(text);
}
async function copyTextToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        alert('Id de la sala copiado al portapapeles');
    } catch (err) {
        alert('Error al copiar el texto: ', err);
    }
    document.getElementById("create").style.display = "none";
    document.getElementById("room-id-textBox").style.display = "none";
}

function cerrarSala(salaID) {
    fetch(`/tateti/cerrar/${salaID}`, { method: "DELETE" })
        .then(res => res.json())
        .then(succes => {
            if (succes.error) {
                throw Error(succes.mensaje)
            }
        })
        .catch(err => {
            alert(err);
        })
}

function otraPartida() {
    cerrarSala(salaID);
    location.reload();
}

function cerrarSalaOnclick() {
    cerrarSala(salaID);
    location.href = "../index.html";
}