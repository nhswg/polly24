'use strict';
import {readFileSync} from "fs";

// Store data in an object to keep the global namespace clean. In an actual implementation this would be interfacing a database...
function Data() {
  this.polls = {};
}

/***********************************************
For performance reasons, methods are added to the
prototype of the Data object/class
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
***********************************************/

Data.prototype.pollExists = function (pollId) {
  return typeof this.polls[pollId] !== "undefined"
}

Data.prototype.getUILabels = function (lang) {
  //check if lang is valid before trying to load the dictionary file
  if (!["en", "sv"].some( el => el === lang))
    lang = "en";
  const labels = readFileSync("./server/data/labels-" + lang + ".json");
  return JSON.parse(labels);
}

Data.prototype.createGame = function(gameData) {
  if (!this.pollExists(gameData.gameId)) {
    let poll = {
      language: gameData.language,
      drawTime: gameData.drawTime,
      rounds: gameData.rounds,
      theme: gameData.theme,
      adminName: gameData.adminName,
      participants: gameData.participants,
      adminID: gameData.adminID,
    };
    poll.participants = {};            
    this.polls[gameData.gameId] = poll;
    console.log("poll created", gameData.gameId, poll);
  }
  return this.polls[gameData.gameId];
}

Data.prototype.getPoll = function(pollId) {
  if (this.pollExists(pollId)) {
    return this.polls[pollId];
  }
  return {};
}

Data.prototype.participateInGame = function(pollId, userID, name) {
  console.log("participant will be added to", pollId, userID, name);
  if (this.pollExists(pollId)) {
    this.polls[pollId].participants[userID]={name: name}
  }
}

Data.prototype.getParticipants = function(pollId) {
  const poll = this.polls[pollId];
  console.log("participants requested for", pollId);
  if (this.pollExists(pollId)) { 
    console.log("participants found", poll.participants);
    return this.polls[pollId].participants
    
  }
  return [];
}

export { Data };



