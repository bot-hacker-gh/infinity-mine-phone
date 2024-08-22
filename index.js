const { setTimeout } = require("timers/promises");
const { randomInt } = require("crypto");
const { urlParseHashParams } = require("./utils");

const input = process.env.TOKEN;

const urlRexExp = new RegExp(
  /https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&\/\/=]*)/gi
);

const url = input.match(urlRexExp)[0];
const hash = new URL(url).hash;
const initData = urlParseHashParams(hash).tgWebAppData;

const sleepRandom = async (ms, accuracy = ms / 5) => await setTimeout(randomInt(ms - accuracy, ms + accuracy));

class User {
  constructor(initData) {
    this.initData = initData;
  }

  async login() {
    const response = await fetch("https://api.hamsterkombatgame.io/auth/auth-by-telegram-webapp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initDataRaw: this.initData }),
    });
    const rawToken = await response.json();
    this.token = "Bearer " + rawToken.authToken;
    console.log("https://api.hamsterkombatgame.io/auth/auth-by-telegram-webapp  " + response.status);
  }

  async post(url) {
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: this.token,
      },
    });

    console.log(url + "  " + result.status);
  }

  async sync() {
    await this.post("https://api.hamsterkombatgame.io/clicker/sync");
  }
}

async function main() {
  try {
    const user = new User(initData);
    await sleepRandom(60 * 1000, 30 * 1000);
    await user.login();
    await user.sync();
  } catch (err) {
    console.log(err);
  }
  console.log("completed");
}

main();
