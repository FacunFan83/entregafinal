const node = document.getElementById("container") // Nodo principal
const pkmURL = "https://pokeapi.co/api/v2/pokemon/" // API Url
const pkmBackpack = [] // array de la mochila
let boss
// crea las escuchas de evento de los botones de paginación
document.getElementById("pA").addEventListener("click", nav)
document.getElementById("p1").addEventListener("click", nav)
document.getElementById("p2").addEventListener("click", nav)
document.getElementById("p3").addEventListener("click", nav)
document.getElementById("p4").addEventListener("click", nav)
document.getElementById("p5").addEventListener("click", nav)
document.getElementById("p6").addEventListener("click", nav)
document.getElementById("p7").addEventListener("click", nav)
document.getElementById("p8").addEventListener("click", nav)
document.getElementById("p9").addEventListener("click", nav)
document.getElementById("p10").addEventListener("click", nav)
document.getElementById("pS").addEventListener("click", nav)

document.getElementById("startBattle").addEventListener("click", battle)

// funcion global para resolver si el id consultado existe o no en el array
const validaArray = (qry) => pkmBackpack.map(el => el.id).indexOf(Number(qry))

async function loadPkm (offset, limit) {
    // Consume los datos de la API de acuerdo a la paginación activa
    let qry = `?limit=${limit}${offset}`
    fetch(`https://pokeapi.co/api/v2/pokemon/${qry}`)
        .then((resp) => resp.json())
        .then((datos) => {

            mostrarPokemon(datos.results)}
            )
}

async function loadBoss () {
fetch("https://pokeapi.co/api/v2/pokemon/146/")
.then((resp) => resp.json())
.then((datos) => {
    boss = datos
    })
}

function nav(e) {
    // navegación dentro de la paginación disponible. Botón de página especifica o movimiento entre páginas
    let nav_target = e.target.id
    let nav_active = document.querySelector(".active").id
    let nav_new = ""
    if (nav_target === "pA" || nav_target === "pS") {
        switch (nav_target) {
            case "pA":
                nav_new = (nav_active != "p1") ? "p" + (parseInt(nav_active.substring(1))-1) : "p1"
                break
            case "pS":
                nav_new = (nav_active != "p10") ? "p" + (parseInt(nav_active.substring(1))+1) : "p10"
                break
        }
    } else {
        nav_new = e.target.id
    }
    document.getElementById(nav_active).className=""
    document.getElementById(nav_new).className="active"
    let nav_new_id = (nav_new === "p10") ? "10" : nav_new[1]
    offset_limit = (parseInt(nav_new_id) * 6) -6
    loadPkm(`&offset=${offset_limit}`,6)
    
}

async function mostrarPokemon (datos) {
    // Renderiza la lista de pokemon de acuerdo a la paginación activa
    // Llamado por loadPkm()
    node.innerHTML=""
    for (element of datos) {
        fetch(element.url)
            .then((resp) => resp.json())
            .then((infoPkm) => {
                let pkmTypes = pkmType(infoPkm.types)
                let new_node = document.createElement("div")
                new_node.innerHTML=`<h2>Pokemon: ${infoPkm.name.toUpperCase()}</h2>
                                    <img src="${infoPkm.sprites.front_default}" width="100" height="100">
                                    <span>#${infoPkm.id}</span>
                                    <span>Tipo: ${pkmTypes}`
                new_node.id = `pkm${infoPkm.id}`
                let existeID = validaArray(infoPkm.id)
                let clase = (existeID < 0) ? "card" : "cardChoose"
                new_node.classList = clase
                new_node.addEventListener("click", add_backpack)
                node.append(new_node)
            })
    }
}

async function add_backpack(e) {
    // Agrega a la mochila el pkm seleccionado
    if (pkmBackpack.length >= 6) {
        // verifica que no se sobrepase la capacidad máxima de la mochila (6)
        msjToast("Ya seleccióno 6 Pokemon")
    } else {
        // Resuelve el target del click. Si el evento es sobre el DIV toma el ID, si el evento es sobre un child, toma el parent
        let node = (e.target.nodeName === "DIV") ? e.target.id : e.target.parentNode.id
        document.getElementById(node).className = "cardChoose"
        let pkmID = node.substring(3) // extrae el encabezado del Id del nodo y se queda con ID del pkm
        let existeID = validaArray(pkmID) // comprueba que no se haya elegido ya el pkm
        if (existeID < 0) {
            // si el pkm no estaba elegido, consume información de la API y guarda en el array
            fetch(pkmURL+pkmID+"/") 
                .then((resp) => resp.json())
                .then((data) => {
                    pkmBackpack.push (data)
                    add_pkm2backpack(pkmBackpack)})
        } else {msjToast("Ya se eligió el PKM")}
        if (pkmBackpack.length == 5) {

        } else {

        }
    }
}

async function add_pkm2backpack (pkm) {
    // Renderiza la mochila en el DOM.
    let parent = document.getElementById("pokemon-elegido")
    parent.innerHTML = ""
    for (element of pkm) {
        let new_node = document.createElement("div")
        new_node.innerHTML = `<div style="width: fit-content"><img src="${element.sprites.front_default}" width="50" height="50"></div>
                              <div style="width: fit-content"><h2>${element.name.toUpperCase()}</h2></div>
                              <div id="delete${element.id}" style="width: fit-content; height: 25px; "><img src="https://img.icons8.com/fluency/25/null/delete-sign.png"/></div>`
        new_node.className="pokemon-contenedor"
        new_node.id = `bkpk${element.id}`
        new_node.addEventListener("click", eleminarSeleccion)
        parent.append(new_node)
    }
    localStorage.setItem("backPack", JSON.stringify(pkm))
}

function eleminarSeleccion(e) {
    // Elimina un elemento de la mochila
    if (e.target.nodeName === "IMG") {
        let nodeID = e.target.parentNode.id
        let parentID = "bkpk" + nodeID.substring(6)
        let idBackpack = validaArray(nodeID.substring(6))
        pkmBackpack.splice(idBackpack,1)
        add_pkm2backpack(pkmBackpack)
        let nav_active = document.querySelector(".active").id.substring(1)
        offset_limit = (parseInt(nav_active) * 6) -6
        loadPkm(`&offset=${offset_limit}`,6)
        localStorage.setItem("backPack", JSON.stringify(pkmBackpack))
    }
}

function pkmType (type) {
    // Crea un string con los diferentes tipos del pkm
    let pkmTypes = ""
    let chrSeparador = (type.length > 1) ? ", " : ""
    let i = 1
    for (element of type) {
        pkmTypes += element.type.name + ((i >= type.length) ? "" : chrSeparador)
        i += 1
    }
    return pkmTypes
}

function getLocalStorage() {
    // Consulta y resuelve los datos del LocalStorage. Si hay datos, crea el array con ellos
    if (localStorage.length > 0) {
        let lStorage = JSON.parse(localStorage.getItem("backPack"))
        for (el of lStorage) {pkmBackpack.push(el)}
        add_pkm2backpack(pkmBackpack)
    }
}

function msjToast(txt) {
    // Toastify para mostrar mensajes informativos en pantalla
    Toastify({
        text: txt,
        duration: 3000,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
      }).showToast();
}

function battle() {
    // Prepara el DOM para la batalla.
    const iniciaBatalla = (pkmBackpack.length === 6) ? true : false

    if (iniciaBatalla) { // Inicia solo si hay 6 pkm elegidos
        // Renderiza el tablero de lucha
        const divBody = document.getElementById("body")
        divBody.innerHTML = ""
        const nuevoDiv1 = document.createElement("div")
        nuevoDiv1.innerHTML = `<div class="container">
                                    <div class="boss" id="boss"></div>
                                    <div class="pkm-choose" id="pkmChoose#1"></div>
                                    <div class="pkm-choose" id="pkmChoose#2"></div>
                                    <div class="pkm-choose" id="pkmChoose#3"></div>
                                    <div class="pkm-choose" id="pkmChoose#4"></div>
                                    <div class="pkm-choose" id="pkmChoose#5"></div>
                                    <div class="pkm-choose" id="pkmChoose#6"></div>
                                </div>`
        divBody.append (nuevoDiv1)
        // Renderiza el Boss
        const divBoss = document.getElementById("boss")
        divBoss.innerHTML = `<h2>Pokemon: ${boss.name.toUpperCase()}</h2>\n
                            <img src="${boss.sprites.front_default}" width="100" height="100">\n
                            <span>HP: ${boss.stats[0].base_stat * 100}/${boss.stats[0].base_stat * 100}`

        let id = 1
        // Renderiza los pkm elegidos
        for (el of pkmBackpack) {
            let nodoId = `pkmChoose#${id}`
            let divAttacks = ""
            for (att of el.abilities) {
                // Crea un boton para cada ataque
                divAttacks = `<button>${att.ability.name}</button>` + divAttacks
            }

            let nodo = document.getElementById(nodoId)
            nodo.innerHTML = `<h2>Pokemon: ${el.name.toUpperCase()}</h2>
                              <img src="${el.sprites.front_default}" width="100" height="100">
                              <span>HP: ${el.stats[0].base_stat}/${el.stats[0].base_stat}</span>
                              ${divAttacks}
                              `
            id++
            }

            let encabezado = document.getElementById("header")
            encabezado.innerHTML = "<h1>Prepárate para la Batalla</h1>"

    }
}

getLocalStorage()
loadPkm ("",6)
loadBoss()