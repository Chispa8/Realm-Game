// items_and_cards.js

export const REWARDS = {
  chest: { count: 0, image: "./icons/chest.png", effect: { money: 15 } },
  crystalBall: {
    count: 0,
    image: "./icons/crystal-ball.png",
    effect: { people: 15 },
  },
  potion: { count: 0, image: "./icons/potion.png", effect: { church: 15 } },
  sword: { count: 0, image: "./icons/sword.png", effect: { army: 15 } },
}

export const specialCards = [
  {
    text: "You've found a mysterious chest!",
    image: "./icons/chest.png",
    reward: "chest",
  },
  {
    text: "A fortune teller offers you a crystal ball.",
    image: "./icons/crystal-ball.png",
    reward: "crystalBall",
  },
  {
    text: "An alchemist presents you with a powerful potion.",
    image: "./icons/potion.png",
    reward: "potion",
  },
  {
    text: "A legendary sword appears before you!",
    image: "./icons/sword.png",
    reward: "sword",
  },
]
