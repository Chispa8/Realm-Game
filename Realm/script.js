import { cards } from "./cards.js"
import { ruler } from "./KQ_names.js"

let factions = {
  army: 75,
  people: 75,
  church: 75,
  money: 75,
  love: 0,
}

let currentCardIndex = 0
let startX = 0
let currentX = 0
let yearCount = 0 // Inicializamos el contador de años en 0

document.addEventListener("DOMContentLoaded", () => {
  const randomRulerIndex = Math.floor(Math.random() * ruler.length)

  const card = document.getElementById("card")
  const acceptIndicator = document.getElementById("accept-indicator")
  const rejectIndicator = document.getElementById("reject-indicator")
  const yearCountElement = document.getElementById("year-count") // Referencia al contador de años

  const acceptSound = new Audio("sounds/accept.mp3")
  const rejectSound = new Audio("sounds/reject.mp3")

  // Actualiza la información del gobernante con el índice aleatorio
  updateRulerDisplay(randomRulerIndex)

  function showCard() {
    const cardData = cards[currentCardIndex]

    // Limpia la carta de contenido anterior
    card.innerHTML = ""

    // Crea un elemento de imagen
    const imgElement = document.createElement("img")
    imgElement.src = cardData.image
    imgElement.alt = "Card Image"
    imgElement.style.width = "70px"
    imgElement.style.height = "70px"
    imgElement.classList.add("oscillating")

    // Crea un elemento de texto
    const textElement = document.createElement("p")
    textElement.textContent = cardData.text

    // Agrega la imagen y el texto al contenedor de la carta
    card.appendChild(imgElement)
    card.appendChild(textElement)

    // Restaura el estado inicial de la carta
    card.style.transform = `translateX(0px) rotate(0deg)`
    card.style.opacity = 1
    acceptIndicator.style.opacity = 0
    rejectIndicator.style.opacity = 0
  }

  function updateRulerDisplay(index) {
    const rulerImage = document.getElementById("ruler-image")
    const rulerName = document.getElementById("ruler-name")
    const rulerCountry = document.getElementById("ruler-country")

    const rulerData = ruler[index]
    rulerImage.src = rulerData.image
    rulerName.textContent = rulerData.rulerName
    rulerCountry.textContent = rulerData.country
  }

  function handleMouseDown(event) {
    startX = event.clientX
    card.style.transition = "none"
  }

  function handleMouseMove(event) {
    if (startX === 0) return
    currentX = event.clientX - startX
    const rotation = currentX / 20
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`

    if (currentX > 0) {
      acceptIndicator.style.opacity = Math.min(currentX / 100, 1)
      rejectIndicator.style.opacity = 0
    } else {
      rejectIndicator.style.opacity = Math.min(-currentX / 100, 1)
      acceptIndicator.style.opacity = 0
    }
  }

  function handleMouseUp() {
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease"

    if (currentX > 100) {
      acceptSound.play() // Reproducir sonido de aceptar
      card.style.transform = `translateX(1000px) rotate(30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("yes") // Actualizar facciones con la decisión "yes"
        updateFactionDisplay() // Actualizar visualmente las barras después de "yes"
        incrementYear() // Incrementar el contador de años
        if (cards[currentCardIndex].next.yes !== undefined) {
          currentCardIndex = cards[currentCardIndex].next.yes
          showCard()
        } else {
          // Lógica para manejar el final del juego o la falta de siguiente carta
        }
      }, 300)
    } else if (currentX < -100) {
      rejectSound.play() // Reproducir sonido de rechazar
      card.style.transform = `translateX(-1000px) rotate(-30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("no") // Actualizar facciones con la decisión "no"
        updateFactionDisplay() // Actualizar visualmente las barras después de "no"
        incrementYear() // Incrementar el contador de años
        if (cards[currentCardIndex].next.no !== undefined) {
          currentCardIndex = cards[currentCardIndex].next.no
          showCard()
        } else {
          // Lógica para manejar el final del juego o la falta de siguiente carta
        }
      }, 300)
    } else {
      card.style.transform = `translateX(0px) rotate(0deg)`
      acceptIndicator.style.opacity = 0
      rejectIndicator.style.opacity = 0
    }

    startX = 0
    currentX = 0
  }

  function incrementYear() {
    yearCount += 1 // Incrementar el año
    yearCountElement.textContent = yearCount // Actualizar el elemento en la UI
  }

  card.addEventListener("mousedown", handleMouseDown)
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)

  showCard()
  updateFactionDisplay() // Asegúrate de que las barras se muestren correctamente desde el principio
})

function updateFactions(decision) {
  const impacts = cards[currentCardIndex].impact[decision]
  if (!impacts) return // Salir si no hay impactos definidos

  for (const faction in impacts) {
    factions[faction] += impacts[faction]
    if (factions[faction] > 100) factions[faction] = 100 // Limitar al 100%
    if (factions[faction] < 0) factions[faction] = 0 // Limitar al 0%
  }
}

function updateFactionDisplay() {
  updateFactionBar(document.getElementById("army-bar"), factions.army)
  updateFactionBar(document.getElementById("people-bar"), factions.people)
  updateFactionBar(document.getElementById("church-bar"), factions.church)
  updateFactionBar(document.getElementById("money-bar"), factions.money)

  if (factions.love > 0) {
    updateFactionBar(document.getElementById("love-bar"), factions.love)
    document.getElementById("love-score").style.display = "block"
  } else {
    document.getElementById("love-score").style.display = "none"
  }
}

function updateFactionBar(factionBar, value) {
  factionBar.style.setProperty("--fill", `${value}%`)
  if (value < 20) {
    factionBar.style.backgroundColor = "red"
  } else if (value < 50) {
    factionBar.style.backgroundColor = "orange"
  } else {
    factionBar.style.backgroundColor = "green"
  }
}
