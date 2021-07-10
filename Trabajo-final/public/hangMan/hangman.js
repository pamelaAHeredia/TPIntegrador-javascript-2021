let intentosRestantes = 0;
let partidaFinalizada = false;
let partidaGanada = false;
let salaID;

const ERROR = document.getElementById('error');
const WORD_PROGRESS_DIV = document.getElementById('word-progress-display');
const ROOM_ID_DISPLAY = document.getElementById('room-id-display');
const TRIES_DISPLAY = document.getElementById('tries-display');
const THE_CLUE = document.getElementById('the-clue'); 
const CLUE_BUTTON = document.getElementById('clue-button'); 
const END_GAME = document.getElementById("end-game"); 

async function getData(URL, body = {}, method = "GET") {
    let response
    if (method === "GET") {
        response = await fetch(URL, {
        method: method,
    })}
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

async function sendLetterRequest(letter) {
    const response = await getData(`/hangman/salas/${salaID}`, {letra: letter} , "PATCH");
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${response.intentosRestantes}`;
    setWordProgress(response.progresoDePalabra);
    if (response.finalizada) {
        //alert(response.mensaje);
        CLUE_BUTTON.style.visibility = "hidden";
        END_GAME.style.visibility = "visible"; 
        if(response.gano === true){
            document.getElementById("l6").style.display = "block"; 
            document.getElementById("l2").style.display = "none"; 
            document.getElementById("l3").style.display = "none"; 
            document.getElementById("l4").style.display = "none"; 
            document.getElementById("l5").style.display = "none"; 
            document.getElementById("l7").style.display = "none"; 
            document.getElementById("l1").style.display = "none";   
        }
        else
            if(response.gano === false){
                document.getElementById("l7").style.display = "block"; 
                document.getElementById("l2").style.display = "none"; 
                document.getElementById("l3").style.display = "none"; 
                document.getElementById("l4").style.display = "none"; 
                document.getElementById("l5").style.display = "none"; 
                document.getElementById("l6").style.display = "none"; 
                document.getElementById("l1").style.display = "none";                 
            }
        document.getElementById("keyboard").style.display = "none";     
        return
    }
    switch(response.intentosRestantes){
        case 5:
            document.getElementById("l1").style.display = "block"; 
            break; 
        case 4:
            document.getElementById("l2").style.display = "block"; 
            document.getElementById("l1").style.display = "none"; 
            break;   
        case 3:
            document.getElementById("l3").style.display = "block"; 
            document.getElementById("l2").style.display = "none"; 
            break;   
        case 2:
            document.getElementById("l4").style.display = "block"; 
            document.getElementById("l3").style.display = "none"; 
            break; 
        case 1:
            document.getElementById("l5").style.display = "block"; 
            document.getElementById("l4").style.display = "none"; 
            break;                        
    }
}

function setWordProgress(arrayOfLetters) {
    WORD_PROGRESS_DIV.innerHTML = "" //clear the progress
    arrayOfLetters.forEach(letter => {
        const newLetterDocument = document.createElement("p"); 
        newLetterDocument.innerHTML = letter ? letter : "_";
        WORD_PROGRESS_DIV.appendChild(newLetterDocument);
    });
}

async function requestNewRoom() {
    const nuevaSala = await getData('/hangman/salas', {}, "POST");
    setWordProgress(nuevaSala.progresoDePalabra);
    salaID = nuevaSala.salaID;
    ROOM_ID_DISPLAY.innerHTML = `ID DE SALA: ${salaID}`;
    TRIES_DISPLAY.innerHTML = `INTENTOS RESTANTES: ${nuevaSala.intentosRestantes}`; 
    THE_CLUE.innerHTML = `PISTA: ${nuevaSala.pista}`;
    console.log(nuevaSala);
    document.getElementById("new-room-button").style.visibility = "hidden"; 
    END_GAME.style.visibility = "hidden"; 
    document.getElementById("miDiv").style.display = 'block'; 
    //alert(nuevaSala.mensaje);
}

function clicked(valor) {
    let seleccion= valor.value;
    valor.disabled=true;
    console.log(seleccion);
    sendLetterRequest(seleccion);
}

function getClue() {
    if(CLUE_BUTTON.value === 'mostrar pista'){
        THE_CLUE.style.display = 'block';
        CLUE_BUTTON.innerHTML = 'esconder pista'; 
        CLUE_BUTTON.value = 'esconder pista'; 
    }
    else if(CLUE_BUTTON.value === 'esconder pista'){ 
            THE_CLUE.style.display = 'none';
            CLUE_BUTTON.innerHTML = 'mostrar pista'; 
            CLUE_BUTTON.value = 'mostrar pista';  
    }    
}
