'use strict';
import {readFileSync} from "fs";

function Data() {
  this.games = {};
}

Data.prototype.gameExists = function (gameID) {
  return typeof this.games[gameID] !== "undefined";
}

Data.prototype.getUILabels = function (lang) {
  if (!["en", "sv"].some(el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createGame = function(gameID, lang="en") {
  if (!this.gameExists(gameID)) {
    const defaultTheme = lang === "sv" ? "Blandat" : "Mixed";
    const defaultWordsLanguage = lang === "sv" ? "Swedish" : "English";
    this.games[gameID] = {
      lang: lang,
      drawTime: 90,
      gameRounds: 3,
      theme: defaultTheme,
      wordsLanguage: defaultWordsLanguage,
      adminName: null,
      participants: {},
      adminID: null,
      currentRound: 1,
      currentWord: '',
      chatHistory: [],
      drawingData: [],
      userScores: {},
      currentDrawerIndex: 0,
      isCanvasCleared: false,
      playersDrawnThisRound: [],
      currentDrawing: null,
      strokes: []
    };
    
    console.log("game created", gameID, this.games[gameID]);
  }
  return this.games[gameID];
}

Data.prototype.addStroke = function(gameID, stroke) {
  if (this.gameExists(gameID)) {
    this.games[gameID].strokes.push(stroke);
    return true;
  }
  return false;
}

Data.prototype.undoLastStroke = function(gameID) {
  if (this.gameExists(gameID) && this.games[gameID].drawingData.length > 0) {
    this.games[gameID].drawingData.pop(); // Remove only last stroke
    return this.games[gameID].drawingData;
  }
  return [];
}

Data.prototype.getGameData = function(gameID) {
  if (this.gameExists(gameID)) {
    console.log("Returning full game details for gameID:", gameID, this.games[gameID]);
    return this.games[gameID];
  }
  return null;
};

Data.prototype.setWordsLanguage = function(gameID, wordsLanguage){
  if (!this.gameExists(gameID)) {
    return false;
  }
  console.log(`Setting words language for game ${gameID} to ${wordsLanguage}`);
  this.games[gameID].wordsLanguage = wordsLanguage;
  return true;
}

Data.prototype.setDrawTime = function(gameID, drawTime){
  if (!this.gameExists(gameID)) {
    return false;
  }
  console.log(`Setting draw time for game ${gameID} to ${drawTime}`);
  this.games[gameID].drawTime = drawTime;
  return true;
}

Data.prototype.getDrawTime = function(gameID){
  if (!this.gameExists(gameID)) {
    return null;
  }
  console.log(`Getting draw time for game ${gameID}:`, this.games[gameID].drawTime);
  return this.games[gameID].drawTime;
}

Data.prototype.setGameRounds = function(gameID, gameRounds){
  if (!this.gameExists(gameID)) {
    return false;
  }
  console.log(`Setting rounds for game ${gameID} to ${gameRounds}`);
  this.games[gameID].gameRounds = gameRounds;
  return true;
}

Data.prototype.getGameRounds = function(gameID){
  if (!this.gameExists(gameID)) {
    return null;
  }
  console.log(`Getting rounds for ${gameID}:`, this.games[gameID].gameRounds);
  return this.games[gameID].gameRounds;
}

Data.prototype.setTheme = function(gameID, theme){
  if (!this.gameExists(gameID)) {
    return false;
  }
  console.log(`Setting theme for game ${gameID} to ${theme}`);
  this.games[gameID].theme = theme;
  return true;
}

Data.prototype.getTheme = function(gameID){
  if (!this.gameExists(gameID)) {
    return null;
  }
  console.log(`Getting theme for ${gameID}:`, this.games[gameID].theme);
  return this.games[gameID].theme;
}


Data.prototype.participateInGame = function(gameID, userID, name) {
  console.log("participant will be added to", gameID, userID, name);
  if (this.gameExists(gameID)) {
    this.games[gameID].participants[userID] = {
      name: name,
      guessedCorrectly: false
    };

  }
}

Data.prototype.getParticipants = function(gameID) {
  if (this.gameExists(gameID)) {
    console.log("participants found for", gameID, this.games[gameID].participants);
    return this.games[gameID].participants;
  }
  return {};
}

Data.prototype.setAdmin = function(gameID, adminID, adminName) {
  if (!this.gameExists(gameID)) {
    return false;
  }
  this.games[gameID].adminID = adminID;
  this.games[gameID].adminName = adminName;

  console.log(`Admin set for game ${gameID}:`, {
    adminID: this.games[gameID].adminID,
    adminName: this.games[gameID].adminName,
  });
  return true;
};

Data.prototype.wordSelected = function(gameID, word){
  if (this.gameExists(gameID)) {
    this.games[gameID].currentWord = word;
  }
}

Data.prototype.getWordSelected = function(gameID) {
  if (this.gameExists(gameID)) {
    return this.games[gameID].currentWord;
  }
}

Data.prototype.updateChatHistory = function(gameID, chatMessage, username) {
  if (this.gameExists(gameID)) {
    this.games[gameID].chatHistory.push({text: chatMessage, username: username});
    console.log("chatMessage:", chatMessage)
  }
}

Data.prototype.getChatHistory = function(gameID) {
  if (this.gameExists(gameID)) {
    return this.games[gameID].chatHistory;
  }
}

// Hämtar alla poäng för ett visst spel
Data.prototype.getScores = function(gameID) {
  if (!this.gameExists(gameID)) return {};
  return this.games[gameID].userScores;
}

// Ökar en specifik användares poäng
Data.prototype.increaseScore = function(gameID, userID, increment) {
  if (!this.gameExists(gameID)) return false;
  
  // Om användaren saknar poäng så initiera med 0
  if (typeof this.games[gameID].userScores[userID] === 'undefined') {
    this.games[gameID].userScores[userID] = 0;
  }
  
  this.games[gameID].userScores[userID] += increment;
  return true;
}

Data.prototype.resetGuesses = function(gameID) {
  // Kolla först om spelet finns
  if (!this.gameExists(gameID)) return;

  // Nollställ guessedCorrectly = false för alla deltagare
  const participants = this.games[gameID].participants;
  for (const userID in participants) {
    participants[userID].guessedCorrectly = false;
  }
  console.log(`All guesses have been reset for game: ${gameID}`);

}

Data.prototype.clearChatHistory = function(gameID) {
  if (!this.gameExists(gameID)) return;
  this.games[gameID].chatHistory = []; 
  console.log(`Chat history cleared for game: ${gameID}`);
}

Data.prototype.addDrawing = function(gameID, drawingData) {
  if (this.gameExists(gameID)) {
    this.games[gameID].drawingData.push(drawingData);
  }
}

Data.prototype.getDrawings = function(gameID) {
  if (this.gameExists(gameID)) {
    return this.games[gameID].drawingData;
  }
  return [];
}

Data.prototype.clearCanvas = function(gameID) {
    console.log('Data.js: Clearing canvas for game:', gameID);
    if (this.gameExists(gameID)) {
        if (!this.games[gameID].drawingData) {
            this.games[gameID].drawingData = [];
        }
        this.games[gameID].drawingData = [];
        this.games[gameID].currentDrawing = null;
        console.log('Data.js: Canvas cleared successfully');
        return true;
    }
    console.log('Data.js: Game not found');
    return false;
}

Data.prototype.removeParticipant = function(gameID, userID) {
  if (this.gameExists(gameID)) {
    delete this.games[gameID].participants[userID];
    console.log(`Participant ${userID} removed from game ${gameID}`);
  }
}

Data.prototype.resetPlayersDrawn = function(gameID) {
  if (!this.gameExists(gameID)) return;
  this.games[gameID].playersDrawnThisRound = [];
};

export { Data };