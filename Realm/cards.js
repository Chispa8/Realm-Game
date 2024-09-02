export const cards = [
  {
    // 0
    text: "This is your realm, and your realm only...",
    image: "./icons/castle.png",
    next: { yes: 1, no: 2 },
    impact: {
      yes: { army: +5, people: +5, church: +5, money: +5 },
      no: { army: +5, people: +5, church: +5, money: +5 },
    },
  },
  {
    //1
    text: "Your army needs better weapons...",
    image: "./icons/weaponUpgrade.png",
    next: { yes: 3, no: 2 },
    impact: { yes: { army: +10, money: -10 }, no: { army: -10, money: +10 } },
  },
  {
    //2
    text: "Your people wants lower taxes...",
    image: "./icons/taxDown.png",
    next: { yes: 5, no: 4 },
    impact: {
      yes: { people: +15, money: -10 },
      no: { people: -15, money: +10 },
    },
  },
  {
    //3
    text: "The church wants to build a huge cathedral. Will you allow that?",
    image: "./icons/hammer.png",
    next: { yes: 6, no: 8 },
    impact: {
      yes: { army: +20, money: +15 },
      no: { people: -20, church: -10, army: +5, money: +5 },
    },
  },
  {
    //4
    text: "Your kingdom is in turmoil. Do you want to use your army to control the outrage?",
    image: "./icons/bomb.png",
    next: { yes: 5, no: 1 },
    impact: {
      yes: { army: -5, money: -5, people: -10, church: +5 },
      no: { people: -20, church: -10, army: +5, money: +5 },
    },
  },
  {
    //5
    text: "Peace has been restored. Give a reward to your people and army?",
    image: "./icons/peace.png",
    next: { yes: 3, no: 4 },
    impact: { yes: { people: +20, army: -5 } },
  },
  {
    //6
    text: "Your coin's president propose you a confusing advice. Follow or not?",
    image: "./icons/influencer.png",
    next: { yes: 7, no: 8 },
    impact: { yes: { army: +15, money: -10 }, no: { people: -10 } },
  },
  {
    //7
    text: "Your allies are asking for help.",
    image: "./icons/help.png",
    next: { yes: 9, no: 10 },
    impact: {
      yes: { army: +10, money: -15 },
      no: { church: -5, people: -10 },
    },
  },
  {
    //8
    text: "The church wants to kill the first born. What's your choice, my lord?",
    image: "./icons/skulls.png",
    next: { yes: 4, no: 1 },
    impact: {
      yes: { army: -10, people: -10, church: +10 },
      no: { army: +10, people: +10, church: -10 },
    },
  },
]
