import { cards, factions } from "./factions_and_cards.js"
import { ruler } from "./KQ_names.js"
import { REWARDS, specialCards } from "./items_and_cards.js"
import goals from "./goals.js"

let currentCardIndex = 0
let startX = 0
let currentX = 0
let yearCount = 0
let cardsSinceLastSpecial = 0
let isSpecialCard = false
let currentGoals = []
let achievedGoals = new Set()
let churchMaxScoreYears = 0
let peopleMaxScoreYears = 0
let armyMaxScoreYears = 0
let treasuryBalanceYears = 0
const numberOfGoals = 3
let isGameOver = false
let gameOverReason = ""

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
      musicButton.textContent = "Stop music"
    } else {
      backgroundMusic.pause()
      musicButton.textContent = "Play music"
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
    initializeGoals()
    showCard()
    updateFactionDisplay()
  }

  function showCard() {
    if (isGameOver) {
      return
    }

    cardsSinceLastSpecial++
    //console.log(`Cards since last special: ${cardsSinceLastSpecial}`)

    if (cardsSinceLastSpecial >= 7 && Math.random() < 0.3) {
      isSpecialCard = true
      showSpecialCard()
    } else {
      isSpecialCard = false
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
    card.style.cursor = "grab"

    document.getElementById("accept-indicator").style.opacity = 0
    document.getElementById("reject-indicator").style.opacity = 0
    document.getElementById("accept-effects").innerHTML = ""
    document.getElementById("reject-effects").innerHTML = ""
  }

  function showSpecialCard() {
    //console.log("Showing special card")
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
    card.style.cursor = "default" // Change cursor to default for special cards

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

    const acceptButton = document.createElement("button")
    acceptButton.textContent = "Accept Item"
    acceptButton.style.width = "200px"
    acceptButton.style.height = "50px"
    acceptButton.classList.add("special-card-button")
    acceptButton.onclick = () => {
      acquireItem(specialCard.reward)
      cardsSinceLastSpecial = 0
      showCard()
    }

    card.appendChild(imgElement)
    card.appendChild(textElement)
    card.appendChild(acceptButton)

    card.style.transform = `translateX(0px) rotate(0deg)`
    card.style.opacity = 1

    document.getElementById("accept-indicator").style.opacity = 0
    document.getElementById("reject-indicator").style.opacity = 0
    document.getElementById("accept-effects").innerHTML = ""
    document.getElementById("reject-effects").innerHTML = ""
  }

  function acquireItem(itemName) {
    //console.log(`Acquiring item: ${itemName}`)
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
    if (isSpecialCard) return // Prevent dragging for special cards
    if (event.target.classList.contains("special-card-button")) return
    startX = event.clientX
    card.style.transition = "none"
  }

  function handleMouseMove(event) {
    if (isSpecialCard) return // Prevent dragging for special cards
    if (startX === 0) return
    currentX = event.clientX - startX
    const rotation = currentX / 20
    card.style.transform = `translateX(${currentX}px) rotate(${rotation}deg)`

    const cardData = cards[currentCardIndex]
    if (cardData) {
      // Check if cardData exists (it won't for special cards)
      const impactsYes = cardData.impact.yes
      const impactsNo = cardData.impact.no

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
    if (isSpecialCard) return
    card.style.transition = "transform 0.3s ease, opacity 0.3s ease"

    if (currentX > 100) {
      acceptSound.play()
      card.style.transform = `translateX(1000px) rotate(30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("yes")
        updateFactionDisplay()
        incrementYear()
        checkGoals()
        isGameOver = checkGameOver()
        if (isGameOver) {
          showGameOverScreen()
        } else if (cards[currentCardIndex].next.yes !== undefined) {
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
        checkGoals()
        isGameOver = checkGameOver()
        if (isGameOver) {
          showGameOverScreen()
        } else if (cards[currentCardIndex].next.no !== undefined) {
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
        <span class="goal-checkmark" data-goal-id="${goal.id}">${
        achievedGoals.has(goal.id) ? "✔️" : ""
      }</span>
      `
      goalsList.appendChild(li)
    })
  }

  function checkGoals() {
    currentGoals.forEach((goal) => {
      if (!achievedGoals.has(goal.id)) {
        switch (goal.id) {
          case 1:
          case 6:
          case 12:
            if (yearCount >= parseInt(goal.description.match(/\d+/)[0])) {
              achieveGoal(goal)
            }
            break
          case 2:
          case 8:
          case 11:
            if (factions.church === 100) {
              churchMaxScoreYears++
              if (
                churchMaxScoreYears >=
                parseInt(goal.description.match(/\d+/)[0])
              ) {
                achieveGoal(goal)
              }
            } else {
              churchMaxScoreYears = 0
            }
            break
          case 3:
          case 7:
          case 10:
            if (factions.money >= 100) {
              treasuryBalanceYears++
              if (
                treasuryBalanceYears >=
                parseInt(goal.description.match(/\d+/)[0])
              ) {
                achieveGoal(goal)
              }
            } else {
              treasuryBalanceYears = 0
            }
            break
          case 4:
          case 14:
          case 15:
            if (factions.army === 100) {
              armyMaxScoreYears++
              if (
                armyMaxScoreYears >= parseInt(goal.description.match(/\d+/)[0])
              ) {
                achieveGoal(goal)
              }
            } else {
              armyMaxScoreYears = 0
            }
            break
          case 5:
          case 9:
            if (factions.people === 100) {
              peopleMaxScoreYears++
              if (
                peopleMaxScoreYears >=
                parseInt(goal.description.match(/\d+/)[0])
              ) {
                achieveGoal(goal)
              }
            } else {
              peopleMaxScoreYears = 0
            }
            break
          case 13:
            if (factions.people === 100 && factions.army === 100) {
              peopleMaxScoreYears++
              if (
                peopleMaxScoreYears >=
                parseInt(goal.description.match(/\d+/)[0])
              ) {
                achieveGoal(goal)
              }
            } else {
              peopleMaxScoreYears = 0
            }
            break
        }
      }
    })
  }

  function achieveGoal(goal) {
    achievedGoals.add(goal.id)
    displayGoals()
    showAlert(`Goal Achieved: ${goal.title}`)
  }

  function showAlert(message) {
    const alertElement = document.createElement("div")
    alertElement.innerHTML = `
      <div class="alert-content">
        <h2>Achievement Unlocked!</h2>
        <p>${message}</p>
        <button class="close-alert">Close</button>
      </div>
    `
    alertElement.className = "custom-alert"
    document.body.appendChild(alertElement)

    const closeButton = alertElement.querySelector(".close-alert")
    closeButton.addEventListener("click", () => {
      alertElement.remove()
    })

    // Optional: Automatically close the alert after 5 seconds
    setTimeout(() => {
      if (document.body.contains(alertElement)) {
        alertElement.remove()
      }
    }, 5000)
  }

  function checkGameOver() {
    if (factions.army <= 0) {
      gameOverReason =
        "Your army has deserted you. Your reign has come to an end."
      return true
    }
    if (factions.people <= 0) {
      gameOverReason =
        "The people have overthrown you. Your reign has come to an end."
      return true
    }
    if (factions.church <= 0) {
      gameOverReason =
        "The church has excommunicated you. Your reign has come to an end."
      return true
    }
    if (factions.money <= 0) {
      gameOverReason =
        "Your kingdom is bankrupt. Your reign has come to an end."
      return true
    }
    if (yearCount >= 100) {
      gameOverReason =
        "You have ruled for a century. Your reign has come to a natural end."
      return true
    }
    return false
  }

  function showGameOverScreen() {
    const gameOverScreen = document.createElement("div")
    gameOverScreen.className = "game-over-screen"
    gameOverScreen.innerHTML = `
      <div class="game-over-content">
        <h1>Game Over</h1>
        <p>${gameOverReason}</p>
        <p>You ruled for ${yearCount} years.</p>
        <button id="restart-button">Play Again</button>
      </div>
    `
    document.body.appendChild(gameOverScreen)

    const restartButton = document.getElementById("restart-button")
    restartButton.addEventListener("click", restartGame)

    gameOverSound.play()
  }

  function restartGame() {
    currentCardIndex = 0
    yearCount = 0
    cardsSinceLastSpecial = 0
    isGameOver = false
    gameOverReason = ""
    achievedGoals = new Set()
    churchMaxScoreYears = 0
    peopleMaxScoreYears = 0
    armyMaxScoreYears = 0
    treasuryBalanceYears = 0

    for (let faction in factions) {
      factions[faction] = 75
    }

    // Remove game over screen
    const gameOverScreen = document.querySelector(".game-over-screen")
    if (gameOverScreen) {
      gameOverScreen.remove()
    }

    startGame()
  }
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
