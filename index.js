const fs = require("fs");
const axios = require("axios");
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let error = false;

async function getUrlWords(url) {
  try {
    const { data } = await axios.get(url);
    const textArr = data
      .split(/[\n\s]/)
      .filter(elem => elem !== "")
      .map(elem => elem.toLowerCase().replace(/\W/, ""));
    return textArr;
  } catch (err) {
    console.log("There was a problem!");
    console.log(err.message);
    questionOne();
  }
}

async function getLocalWords(path) {
  const data = await fs.readFile(path);
  const textArr = data
    .split(/[\n\s]/)
    .filter(elem => elem !== "")
    .map(elem => elem.toLowerCase().replace(/\W/, ""));
  return textArr;
}

function createMarkov(textArr) {
  const ngrams = {};
  for (let i = 0; i < textArr.length; i++) {
    let gram = textArr[i];
    if (!ngrams[gram]) {
      ngrams[gram] = [];
    }
    if (textArr[i + 1]) {
      ngrams[gram].push(textArr[i + 1]);
    }
  }
  return ngrams;
}
function questionOne() {
  function askQuestion() {
    rl.question(
      "Choose from the following: \n (1) Create Markov Chain from url txt file. \n (2) Create Markov Chain from local txt file.  (3) Create Markov Chain from entered text. \n(4) Exit.  \n  Your Response:  ",
      function(answer) {
        let textArr;
        switch (answer) {
          case "1":
            rl.question("Enter url: ", async function(url) {
              textArr = await getUrlWords(url);
              questionTwo(textArr);
            });
            break;
          case "2":
            rl.question("Enter absolute path to file: ", async function(path) {
              textArr = await getLocalWords(path);
              questionTwo(textArr);
            });
            break;
          case "3":
            rl.question(
              "Type or paste text source for Markov chain here: ",
              function(text) {
                const textArr = text
                  .split(/[\n\s]/)
                  .filter(elem => elem !== "")
                  .map(elem => elem.toLowerCase().replace(/\W/, ""));
                questionTwo(textArr);
              }
            );
            break;
          case "4":
            process.exit(0);
            break;
          default:
            console.log("Invalid Option.  Please enter 1, 2, 3, or 4.");
            askQuestion();
        }
      }
    );
  }
  askQuestion();
}
function questionTwo(textArr) {
  if (textArr) {
    let markov = createMarkov(textArr);
    rl.question(
      `Enter target filename, or blank for "markov.json  : `,
      async function(filename) {
        let path = filename || "markov.json";
        await fs.writeFile(path, JSON.stringify(markov), function(err) {
          if (err) {
            throw err;
          }
          console.log("Markov chain successfully written at " + path);
          process.exit(0);
        });
      }
    );
  }
}

function runProgram() {
  questionOne();
}

runProgram();
