import { cards, factions } from "./factions_and_cards.js"
import { ruler } from "./KQ_names.js"
import { REWARDS, specialCards } from "./items_and_cards.js"
import goals from "./goals.js"

let currentCardIndex = 0
let startX = 0
let currentX = 0
let yearCount = 0
let cardsSinceLastSpecial = 0
const numberOfGoals = 3 // Number of goals to display per round
let currentGoals = []

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen")
  const gameScreen = document.getElementById("game-screen")
  const playButton = document.getElementById("play-button")
  const musicButton = document.getElementById("music-button")
  const backgroundMusic = document.getElementById("background-music")
  const volumeSlider = document.getElementById("volume-slider")
  const volumeIcon = document.getElementById("volume-icon")

  const randomRulerIndex = Math.floor(Math.random() * ruler.length)

  const card = document.getElementById("card")
  const acceptIndicator = document.getElementById("accept-indicator")
  const rejectIndicator = document.getElementById("reject-indicator")
  const yearCountElement = document.getElementById("year-count")

  const acceptSound = new Audio("sounds/accept.mp3")
  const rejectSound = new Audio("sounds/reject.mp3")
  const gameOverSound = new Audio("sounds/lose.mp3")

  let isMuted = false
  let isPlaying = false

  function toggleMusic() {
    if (!isPlaying) {
      backgroundMusic.volume = parseFloat(volumeSlider.value)
      backgroundMusic.play().catch((error) => {
        console.error("Error al reproducir la música:", error)
      })
      musicButton.textContent = "Detener música"
    } else {
      backgroundMusic.pause()
      musicButton.textContent = "Iniciar música"
    }
    isPlaying = !isPlaying
  }

  musicButton.addEventListener("click", toggleMusic)

  playButton.addEventListener("click", () => {
    startScreen.style.display = "none"
    gameScreen.style.display = "block"
    startGame()
  })

  volumeSlider.addEventListener("input", (e) => {
    const volume = parseFloat(e.target.value)
    backgroundMusic.volume = volume
    updateVolumeIcon(volume)
  })

  volumeIcon.addEventListener("click", toggleMute)

  function updateVolumeIcon(volume) {
    if (volume === 0) {
      volumeIcon.textContent = "🔇"
    } else if (volume < 0.5) {
      volumeIcon.textContent = "🔉"
    } else {
      volumeIcon.textContent = "🔊"
    }
  }

  function toggleMute() {
    isMuted = !isMuted
    backgroundMusic.muted = isMuted
    if (isMuted) {
      volumeIcon.textContent = "🔇"
    } else {
      updateVolumeIcon(parseFloat(volumeSlider.value))
    }
  }

  updateRulerDisplay(randomRulerIndex)

  function startGame() {
    initializeGoals() // Initialize goals when starting the game
    showCard()
    updateFactionDisplay()
  }

  function showCard() {
    cardsSinceLastSpecial++
    console.log(`Cards since last special: ${cardsSinceLastSpecial}`)

    if (cardsSinceLastSpecial >= 5 && Math.random() < 0.3) {
      showSpecialCard()
    } else {
      showRegularCard()
    }
  }

  function showRegularCard() {
    const cardData = cards[currentCardIndex]

    card.innerHTML = ""

    const imgElement = document.createElement("img")
    imgElement.src = cardData.image
    imgElement.alt = "Card Image"
    imgElement.style.width = "8em"
    imgElement.style.height = "8em"
    imgElement.classList.add("oscillating")

    const textElement = document.createElement("p")
    textElement.textContent = cardData.text

    card.appendChild(imgElement)
    card.appendChild(textElement)

    card.style.transform = `translateX(0px) rotate(0deg)`
    card.style.opacity = 1

    document.getElementById("accept-indicator").style.opacity = 0
    document.getElementById("reject-indicator").style.opacity = 0
    document.getElementById("accept-effects").innerHTML = ""
    document.getElementById("reject-effects").innerHTML = ""

    card.onclick = null
  }

  function showSpecialCard() {
    console.log("Showing special card")
    const specialCard =
      specialCards[Math.floor(Math.random() * specialCards.length)]

    card.innerHTML = ""

    card.style.backgroundColor = "#d09035"
    card.style.borderRadius = "10px"
    card.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2)"
    card.style.display = "flex"
    card.style.flexDirection = "column"
    card.style.justifyContent = "center"
    card.style.alignItems = "center"
    card.style.fontSize = "1em"
    card.style.fontWeight = "bold"
    card.style.color = "#25221f"

    const imgElement = document.createElement("img")
    imgElement.src = specialCard.image
    imgElement.alt = "Special Card Image"
    imgElement.style.width = "8em"
    imgElement.style.height = "8em"
    imgElement.classList.add("oscillating")

    const textElement = document.createElement("p")
    textElement.textContent = specialCard.text
    textElement.style.margin = "1em 0"
    textElement.style.textAlign = "center"

    card.appendChild(imgElement)
    card.appendChild(textElement)

    card.style.transform = `translateX(0px) rotate(0deg)`
    card.style.opacity = 1

    document.getElementById("accept-indicator").style.opacity = 0
    document.getElementById("reject-indicator").style.opacity = 0
    document.getElementById("accept-effects").innerHTML = ""
    document.getElementById("reject-effects").innerHTML = ""

    card.onclick = () => {
      acquireItem(specialCard.reward)
      cardsSinceLastSpecial = 0
      showCard()
    }
  }

  function acquireItem(itemName) {
    console.log(`Acquiring item: ${itemName}`)
    REWARDS[itemName].count++
    updateItemDisplay(itemName)
  }

  function updateItemDisplay(itemName) {
    const itemElement = document.getElementById(`${itemName}-item`)
    const countElement = itemElement.querySelector(".item-count")
    countElement.textContent = REWARDS[itemName].count
  }

  document.querySelectorAll(".item").forEach((item) => {
    item.addEventListener("click", () => {
      const itemName = item.id.split("-")[0]
      useItem(itemName)
    })
  })

  function useItem(itemName) {
    if (REWARDS[itemName].count > 0) {
      REWARDS[itemName].count--
      updateItemDisplay(itemName)

      const effect = REWARDS[itemName].effect
      for (const faction in effect) {
        factions[faction] += effect[faction]
        if (factions[faction] > 100) factions[faction] = 100
      }

      updateFactionDisplay()
    }
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

    const impactsYes = cards[currentCardIndex].impact.yes
    const impactsNo = cards[currentCardIndex].impact.no

    if (currentX > 0) {
      acceptIndicator.style.opacity = Math.min(currentX / 100, 1)
      rejectIndicator.style.opacity = 0
      document.getElementById("accept-effects").innerHTML =
        formatImpacts(impactsYes)
      document.getElementById("reject-effects").innerHTML = ""
    } else {
      rejectIndicator.style.opacity = Math.min(-currentX / 100, 1)
      acceptIndicator.style.opacity = 0
      document.getElementById("reject-effects").innerHTML =
        formatImpacts(impactsNo)
      document.getElementById("accept-effects").innerHTML = ""
    }
  }

  function formatImpacts(impacts) {
    let effectsText = ""
    for (const faction in impacts) {
      const impactValue = impacts[faction]
      const sign = impactValue > 0 ? "+" : ""
      effectsText += `<p>${faction}: ${sign}${impactValue}</p>`
    }
    return effectsText
  }

  function handleMouseUp() {
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease"

    if (currentX > 100) {
      acceptSound.play()
      card.style.transform = `translateX(1000px) rotate(30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("yes")
        updateFactionDisplay()
        incrementYear()
        if (cards[currentCardIndex].next.yes !== undefined) {
          currentCardIndex = cards[currentCardIndex].next.yes
          showCard()
        }
      }, 300)
    } else if (currentX < -100) {
      rejectSound.play()
      card.style.transform = `translateX(-1000px) rotate(-30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("no")
        updateFactionDisplay()
        incrementYear()
        if (cards[currentCardIndex].next.no !== undefined) {
          currentCardIndex = cards[currentCardIndex].next.no
          showCard()
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
    yearCount += 1
    yearCountElement.textContent = yearCount
  }

  card.addEventListener("mousedown", handleMouseDown)
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)

  function initializeGoals() {
    currentGoals = getRandomGoals(numberOfGoals)
    displayGoals()
  }

  function getRandomGoals(count) {
    const shuffled = [...goals].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, count)
  }

  function displayGoals() {
    const goalsList = document.getElementById("goals-list")
    goalsList.innerHTML = ""

    currentGoals.forEach((goal) => {
      const li = document.createElement("li")
      li.innerHTML = `
        <span class="goal-icon">${goal.icon}</span>
        <div class="goal-content">
          <h3>${goal.title}</h3>
          <p>${goal.description}</p>
        </div>
        <input type="checkbox" class="goal-checkbox" data-goal-id="${goal.id}">
      `
      goalsList.appendChild(li)
    })

    document.querySelectorAll(".goal-checkbox").forEach((checkbox) => {
      checkbox.addEventListener("change", (e) => {
        const goalId = parseInt(e.target.getAttribute("data-goal-id"))
        updateGoalStatus(goalId, e.target.checked)
      })
    })
  }

  function updateGoalStatus(goalId, completed) {
    const goal = currentGoals.find((g) => g.id === goalId)
    if (goal) {
      goal.completed = completed
      // Add more logic here, such as updating the player's score
    }
  }

  // Remove this line as initializeGoals is now called in startGame
  // initializeGoals()
})

function updateFactions(decision) {
  const impacts = cards[currentCardIndex].impact[decision]
  if (!impacts) return

  for (const faction in impacts) {
    factions[faction] += impacts[faction]
    if (factions[faction] > 100) factions[faction] = 100
    if (factions[faction] < 0) factions[faction] = 0
  }
}

function updateFactionDisplay() {
  updateFactionIcon("army-fill", factions.army)
  updateFactionIcon("people-fill", factions.people)
  updateFactionIcon("church-fill", factions.church)
  updateFactionIcon("money-fill", factions.money)

  if (factions.love > 0) {
    updateFactionIcon("love-fill", factions.love)
    document.getElementById("love-score").style.display = "block"
  } else {
    document.getElementById("love-score").style.display = "none"
  }
}

function updateFactionIcon(fillId, value) {
  const fillElement = document.getElementById(fillId)
  fillElement.style.height = `${value}%`

  if (value < 25) {
    fillElement.style.backgroundColor = "rgba(255, 0, 0, 0.5)"
  } else if (value < 50) {
    fillElement.style.backgroundColor = "rgba(255, 165, 0, 0.5)"
  } else if (value < 75) {
    fillElement.style.backgroundColor = "rgba(255, 255, 0, 0.5)"
  } else {
    fillElement.style.backgroundColor = "rgba(0, 255, 0, 0.5)"
  }
}
