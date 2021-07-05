const fs = require('fs');

class SalasManager {

    constructor (fileLocation, codecFormat) {
        this.fileLocation = fileLocation;
        this.codecFormat = codecFormat;
    }

    findTodasLasSalas() {
        const salas = fs.readFileSync(this.fileLocation, this.codecFormat);
        return JSON.parse(salas);
    }
    
    modificarTodasLasSalas(salas) {
        const salasEnTexto = JSON.stringify(salas, null, 5);
        fs.writeFileSync(this.fileLocation, salasEnTexto);
    }
    
    findSala(id) {
        const salas = this.findTodasLasSalas();
        const salaEncontrada = salas.find( (sala) => sala.id === id );
        return salaEncontrada;
    }
    
    guardarSala(sala) {
        const salas = this.findTodasLasSalas();
        salas.push(sala);
        this.modificarTodasLasSalas(salas);
    }
    
    eliminarSalaPorID(id) {
        const salas = this.findTodasLasSalas();
        const indiceDeSalaEncontrada = salas.findIndex( (sala) => sala.id === id );
        if (indiceDeSalaEncontrada === -1) return false;
        salas.splice(indiceDeSalaEncontrada, 1)
        this.modificarTodasLasSalas(salas);
        return true;
    }
    
    modificarSalaPorId(id, sala) {
        const salas = this.findTodasLasSalas();
        const indiceDeSalaEncontrada = salas.findIndex( (sala) => sala.id === id );
        if (indiceDeSalaEncontrada === -1) return false;
        salas[indiceDeSalaEncontrada] = sala;
        this.modificarTodasLasSalas(salas);
        return true;
    }
}

module.exports = SalasManager;