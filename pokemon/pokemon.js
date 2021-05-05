function listarPaginas(url) {
	var p = new XMLHttpRequest();
	p.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
				let pokes = JSON.parse(this.responseText);
				let cantPaginas = Math.ceil(pokes.count/75);
				let miLista = document.getElementById("paginas");
				let offset = 0;
				for (let i = 1; i <= cantPaginas; i++) {
		    		let op = document.createElement("option");
		    		op.value = "?limit=75&offset="+offset;
		    		op.text = "Pagina " + i;
		    		miLista.appendChild(op);
		    		offset = offset + 75;
		      	}  
	      	} 
		};
		p.open("GET", url, true);
		p.send();
  }

