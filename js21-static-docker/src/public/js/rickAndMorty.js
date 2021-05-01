function generarMenu() {
	var x = new XMLHttpRequest();
	var cant;
	x.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var paginas = JSON.parse(this.responseText);
			cantPaginas = paginas.info.pages;
			var padre = document.body;
			var listaSelect = document.createElement("select");
			listaSelect.id = "miSelect";
			padre.appendChild(listaSelect);
			for (let i = 1; i <= cantPaginas; i++) {
		    	let op = document.createElement("option");
		    	op.value =  i;
		    	op.id = i;
		    	op.text = "Pagina " + i;
		    	listaSelect.appendChild(op);
				}
		  }
	};
	x.open("GET", "https://rickandmortyapi.com/api/character/", true);
	x.send();
 }       



function mostrar() {
	let opcion = document.getElementById("opcion");
	var especie = opcion.options[opcion.selectedIndex].value;
	let selectPag = document.getElementById("miSelect");
	var mostrarPag = selectPag.options[selectPag.selectedIndex].value;
	especies(mostrarPag, especie);
	let lista = document.getElementById("miLista");
	lista.innerHTML= '';
}

function especies(pag, especie) {
	var http1 = new XMLHttpRequest();
	http1.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var personajes = JSON.parse(this.responseText);
			var miList = document.getElementById("miLista");
			var p = 0;
			for (let nombres in personajes.results)  {
				if (especie == "Todos") {
					let unPersonaje = document.createElement('li');
					unPersonaje.textContent = personajes.results[p].name;
					miList.appendChild(unPersonaje);	
				}
				else if (personajes.results[p].species == especie) {
					let unPersonaje = document.createElement('li');
					unPersonaje.textContent = personajes.results[p].name;
					miList.appendChild(unPersonaje);
				}
				p++;
			}
		}
	};
	http1.open("GET", "https://rickandmortyapi.com/api/character/?page="+pag, true);
	http1.send();
}




