import { cards, factions } from "./factions_and_cards.js"
import { ruler } from "./KQ_names.js"
import { REWARDS, specialCards } from "./items_and_cards.js"
import goals from "./goals.js"

let currentCardIndex = 0
let startX = 0
let currentX = 0
let yearCount = 0
let cardsSinceLastSpecial = 0
let currentGoals = []
let achievedGoals = new Set()
let churchMaxScoreYears = 0
let peopleMaxScoreYears = 0
let armyMaxScoreYears = 0
let treasuryBalanceYears = 0
const numberOfGoals = 3
let isGameOver = false
let gameOverReason = ""
let score = 0
let isSpecialCard = false
let highScores = []

document.addEventListener("DOMContentLoaded", () => {
  const startScreen = document.getElementById("start-screen")
  const gameScreen = document.getElementById("game-screen")
  const playButton = document.getElementById("play-button")
  const continueButton = document.getElementById("continue-button")
  const highScoresButton = document.getElementById("high-scores-button")
  const musicButton = document.getElementById("music-button")
  const backgroundMusic = document.getElementById("background-music")
  const volumeSlider = document.getElementById("volume-slider")
  const volumeIcon = document.getElementById("volume-icon")
  const mainMenuButton = document.getElementById("main-menu-button")

  const randomRulerIndex = Math.floor(Math.random() * ruler.length)

  const card = document.getElementById("card")
  const acceptIndicator = document.getElementById("accept-indicator")
  const rejectIndicator = document.getElementById("reject-indicator")
  const yearCountElement = document.getElementById("year-count")

  const acceptSound = new Audio("sounds/accept.mp3")
  const rejectSound = new Audio("sounds/reject.mp3")
  const gameOverSound = new Audio("sounds/lose.mp3")
  const goalAchievedSound = new Audio("sounds/achievement-win-drums.mp3")

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

  continueButton.addEventListener("click", () => {
    loadGame()
    startScreen.style.display = "none"
    gameScreen.style.display = "block"
  })

  highScoresButton.addEventListener("click", showHighScores)

  mainMenuButton.addEventListener("click", () => {
    saveGame()
    gameScreen.style.display = "none"
    startScreen.style.display = "flex"
    startScreen.style.flexDirection = "column"
    startScreen.style.justifyContent = "center"
    startScreen.style.alignItems = "center"
    updateContinueButtonState()
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
    currentCardIndex = 0
    score = 0
    updateScore(0)
    yearCount = 0
    cardsSinceLastSpecial = 0
    yearCountElement.textContent = yearCount
    initializeGoals()
    resetFactions()
    resetItems()
    showCard()
    updateFactionDisplay()
    isGameOver = false
    churchMaxScoreYears = 0
    peopleMaxScoreYears = 0
    armyMaxScoreYears = 0
    treasuryBalanceYears = 0
    achievedGoals = new Set()
  }

  function resetFactions() {
    for (let faction in factions) {
      factions[faction] = 75
    }
    factions.love = 0
  }

  function resetItems() {
    for (let item in REWARDS) {
      REWARDS[item].count = 0
      updateItemDisplay(item)
    }
  }

  function showCard() {
    if (isGameOver) {
      return
    }

    cardsSinceLastSpecial++
    console.log(`Cards since last special: ${cardsSinceLastSpecial}`)

    if (cardsSinceLastSpecial >= 5 && Math.random() < 0.3) {
      isSpecialCard = true
      showSpecialCard()
    } else {
      isSpecialCard = false
      showRegularCard()
    }

    card.style.opacity = 1
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

    card.style.transition = "all 0.3s ease"
    card.style.boxShadow =
      "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23), 0 0 15px gold"
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"
    card.style.background = "linear-gradient(45deg, #d09035, #ffd700)"
    card.style.border = "2px solid gold"

    document.getElementById("accept-indicator").style.opacity = 0
    document.getElementById("reject-indicator").style.opacity = 0
    document.getElementById("accept-effects").innerHTML = ""
    document.getElementById("reject-effects").innerHTML = ""

    card.style.opacity = 1
  }

  function showSpecialCard() {
    console.log("Showing special card")
    const specialCard =
      specialCards[Math.floor(Math.random() * specialCards.length)]

    card.innerHTML = ""

    card.style.backgroundColor = "#d09035"
    card.style.borderRadius = "10px"
    card.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.2), 0 0 15px gold"
    card.style.display = "flex"
    card.style.flexDirection = "column"
    card.style.justifyContent = "center"
    card.style.alignItems = "center"
    card.style.fontSize = "1em"
    card.style.fontWeight = "bold"
    card.style.color = "#25221f"
    card.style.cursor = "default"

    card.style.transition = "all 0.3s ease"
    card.style.boxShadow =
      "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23), 0 0 15px gold"
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0)"
    card.style.background = "linear-gradient(45deg, #d09035, #ffd700)"
    card.style.border = "2px solid gold"

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

  const helpButton = document.querySelector(".help-button")
  helpButton.addEventListener("click", showItemInfo)

  function showItemInfo() {
    const itemInfo = {
      sword: { name: "Sword", effect: "Army +15" },
      crystalBall: { name: "Crystal Ball", effect: "People +15" },
      potion: { name: "Potion", effect: "Church +15" },
      chest: { name: "Chest", effect: "Money +15" },
    }

    let infoContent = "<h2>Item Effects</h2>"
    for (const [key, item] of Object.entries(itemInfo)) {
      infoContent += `<p><strong>${item.name}:</strong> ${item.effect}</p>`
    }

    const alertElement = document.createElement("div")
    alertElement.innerHTML = `
      <div class="alert-content">
        ${infoContent}
        <button class="close-alert">Close</button>
      </div>
    `
    alertElement.className = "custom-alert"
    document.body.appendChild(alertElement)

    const closeButton = alertElement.querySelector(".close-alert")
    closeButton.addEventListener("click", () => {
      alertElement.remove()
    })

    setTimeout(() => {
      if (document.body.contains(alertElement)) {
        alertElement.remove()
      }
    }, 10000)
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
    if (isSpecialCard) return
    if (event.target.classList.contains("special-card-button")) return
    startX = event.clientX
    card.style.transition = "none"
  }

  function handleMouseMove(event) {
    if (isSpecialCard) return
    if (startX === 0) return
    currentX = event.clientX - startX
    const rotation = currentX / 20
    card.style.transform = `perspective(1000px) translateX(${currentX}px) rotateY(${rotation}deg)`

    const cardData = cards[currentCardIndex]
    if (cardData) {
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
      card.style.transform = `perspective(1000px) translateX(1000px) rotateY(30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("yes")
        updateFactionDisplay()
        incrementYear()
        checkGoals()
        updateScore(100)
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
      card.style.transform = `perspective(1000px) translateX(-1000px) rotateY(-30deg)`
      card.style.opacity = 0
      setTimeout(() => {
        updateFactions("no")
        updateFactionDisplay()
        incrementYear()
        checkGoals()
        updateScore(100)
        isGameOver = checkGameOver()
        if (isGameOver) {
          showGameOverScreen()
        } else if (cards[currentCardIndex].next.no !== undefined) {
          currentCardIndex = cards[currentCardIndex].next.no
          showCard()
        }
      }, 300)
    } else {
      card.style.transform = `perspective(1000px) translateX(0px) rotateY(0deg)`
      acceptIndicator.style.opacity = 0
      rejectIndicator.style.opacity = 0
    }

    startX = 0
    currentX = 0
  }

  function incrementYear() {
    yearCount += 1
    yearCount = Math.min(yearCount, 100)
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
            if (factions.money >= parseInt(goal.description.match(/\d+/)[0])) {
              achieveGoal(goal)
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
    goalAchievedSound.play()
    achievedGoals.add(goal.id)
    displayGoals()
    updateScore(200)
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
        <p>Final Score: ${score}</p>
        <button id="restart-button">Play Again</button>
        <button id="main-menu-button-gameover">Main Menu</button>
      </div>
    `
    document.body.appendChild(gameOverScreen)

    const restartButton = document.getElementById("restart-button")
    restartButton.addEventListener("click", restartGame)

    const mainMenuButtonGameOver = document.getElementById(
      "main-menu-button-gameover"
    )
    mainMenuButtonGameOver.addEventListener("click", () => {
      gameOverScreen.remove()
      gameScreen.style.display = "none"
      startScreen.style.display = "flex"
      startScreen.style.flexDirection = "column"
      startScreen.style.justifyContent = "center"
      startScreen.style.alignItems = "center"
      updateContinueButtonState()
    })

    gameOverSound.play()
    updateHighScores(score)
    isGameOver = true
    saveGame()
  }

  function restartGame() {
    const gameOverScreen = document.querySelector(".game-over-screen")
    if (gameOverScreen) {
      gameOverScreen.remove()
    }
    startGame()

    setTimeout(() => {
      card.style.opacity = 1
    }, 0)
  }

  function updateScore(points) {
    score += points
    document.getElementById("score-display").textContent = `Score: ${score}`
  }

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

  function saveGame() {
    const gameState = {
      currentCardIndex,
      yearCount,
      cardsSinceLastSpecial,
      currentGoals,
      achievedGoals: Array.from(achievedGoals),
      churchMaxScoreYears,
      peopleMaxScoreYears,
      armyMaxScoreYears,
      treasuryBalanceYears,
      score,
      factions,
      REWARDS,
      isGameOver,
    }
    localStorage.setItem("gameState", JSON.stringify(gameState))
  }

  function loadGame() {
    const savedState = JSON.parse(localStorage.getItem("gameState"))
    if (savedState) {
      currentCardIndex = savedState.currentCardIndex
      yearCount = savedState.yearCount
      cardsSinceLastSpecial = savedState.cardsSinceLastSpecial
      currentGoals = savedState.currentGoals
      achievedGoals = new Set(savedState.achievedGoals)
      churchMaxScoreYears = savedState.churchMaxScoreYears
      peopleMaxScoreYears = savedState.peopleMaxScoreYears
      armyMaxScoreYears = savedState.armyMaxScoreYears
      treasuryBalanceYears = savedState.treasuryBalanceYears
      score = savedState.score
      Object.assign(factions, savedState.factions)
      Object.assign(REWARDS, savedState.REWARDS)
      isGameOver = savedState.isGameOver

      updateScore(0)
      displayGoals()
      updateFactionDisplay()
      showCard()
      yearCountElement.textContent = yearCount

      for (const itemName in REWARDS) {
        updateItemDisplay(itemName)
      }
    } else {
      alert("No saved game found. Starting a new game.")
      startGame()
    }
  }

  function updateHighScores(newScore) {
    highScores = JSON.parse(localStorage.getItem("highScores")) || []
    highScores.push(newScore)
    highScores.sort((a, b) => b - a)
    highScores = highScores.slice(0, 5)
    localStorage.setItem("highScores", JSON.stringify(highScores))
  }

  function showHighScores() {
    const highScoresScreen = document.createElement("div")
    highScoresScreen.className = "high-scores-screen"
    highScoresScreen.innerHTML = `
      <div class="high-scores-content">
        <h1>High Scores</h1>
        <ol>
          ${highScores.map((score) => `<li>${score}</li>`).join("")}
        </ol>
        <button id="close-high-scores">Close</button>
      </div>
    `
    document.body.appendChild(highScoresScreen)

    const closeButton = document.getElementById("close-high-scores")
    closeButton.addEventListener("click", () => {
      highScoresScreen.remove()
    })
  }

  function updateContinueButtonState() {
    const savedState = JSON.parse(localStorage.getItem("gameState"))
    if (savedState && !savedState.isGameOver) {
      continueButton.disabled = false
      continueButton.style.opacity = 1
    } else {
      continueButton.disabled = true
      continueButton.style.opacity = 0.5
    }
  }

  // Load high scores on startup
  highScores = JSON.parse(localStorage.getItem("highScores")) || []

  updateContinueButtonState()
})
