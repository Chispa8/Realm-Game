const cards = [
  {
    text: "This is your realm, and your realm only...",
    next: { yes: 1, no: 2 },
    impact: {
      yes: { army: +5, people: +5, church: +5, money: +5 },
      no: { army: +5, people: +5, church: +5, money: +5 },
    },
  },
  {
    text: "Your army needs better weapons...",
    next: { yes: 3, no: 4 },
    impact: { yes: { army: +10, money: -10 }, no: { army: -10, money: +10 } },
  },
  {
    text: "Your people wants lower taxes...",
    next: { yes: 5, no: 6 },
    impact: {
      yes: { people: +15, money: -10 },
      no: { people: -15, money: +10 },
    },
  },
  {
    text: "The !",
    next: {},
    impact: { yes: { army: +20, money: +15 } },
  },
  {
    text: "Your kingdom is in turmoil.",
    next: {},
    impact: { no: { people: -20, church: -10 } },
  },
  {
    text: "Peace has been restored.",
    next: {},
    impact: { yes: { people: +20, army: -5 } },
  },
  {
    text: "A new threat looms in the horizon.",
    next: { yes: 7, no: 8 },
    impact: { yes: { army: +15, money: -10 }, no: { people: -10 } },
  },
  {
    text: "Your allies are asking for help.",
    next: { yes: 9, no: 10 },
    impact: {
      yes: { army: +10, money: -15 },
      no: { church: -5, people: -10 },
    },
  },
  {
    text: "Would you like to marry the queen?",
    next: { yes: 11, no: 12 },
    impact: { yes: { love: +100 }, no: {} },
  },
]

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

document.addEventListener("DOMContentLoaded", () => {
  const card = document.getElementById("card")
  const acceptIndicator = document.getElementById("accept-indicator")
  const rejectIndicator = document.getElementById("reject-indicator")

  const acceptSound = new Audio("sounds/accept.mp3")
  const rejectSound = new Audio("sounds/reject.mp3")

  function showCard() {
    const cardData = cards[currentCardIndex]
    card.textContent = cardData.text
    card.style.transform = `translateX(0px) rotate(0deg)`
    card.style.opacity = 1
    acceptIndicator.style.opacity = 0
    rejectIndicator.style.opacity = 0
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
