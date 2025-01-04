function sockets(io, socket, data) {
    
  socket.on('getUILabels', function(lang) {
    socket.emit('uiLabels', data.getUILabels(lang));
  });

  socket.on('createGame', function(d) {
    data.createGame(d.gameID, d.lang);
    socket.join(d.gameID);
    socket.emit('gameData', data.getGameData(d.gameID));
  });

  socket.on('joinGame', function(gameID) {
    console.log('joinGame', gameID);
    socket.join(gameID);
    const participants = data.getParticipants(gameID);
    console.log('participants', participants);
    socket.emit('participantsUpdate', participants);
    socket.emit('selectedWord', data.getWordSelected(gameID));
    socket.emit('sendChatHistory', data.getChatHistory(gameID));
  });

  socket.on('participateInGame', function(d) {
    data.participateInGame(d.gameID, d.userID, d.name);
    io.to(d.gameID).emit('participantsUpdate', data.getParticipants(d.gameID));
  });

  socket.on('setAdmin', function (d) {
    console.log(`Setting admin for game ${d.gameID} with ID: ${d.adminID} and Name: ${d.adminName}`);
    const result = data.setAdmin(d.gameID, d.adminID, d.adminName);
  
    if (result) {
      console.log(`Admin successfully set for game ${d.gameID}`);
    } else {
      console.log(`Failed to set admin for game ${d.gameID}`);
    }
  });

  socket.on('setWordsLanguage', function(d) {
    console.log('Setting words language for game:', d.gameID, 'to:', d.wordsLanguage);
    const result = data.setWordsLanguage(d.gameID, d.wordsLanguage);
    console.log('Result of setWordsLanguage:', result);
  });

  socket.on('setDrawTime', function(d) {
    console.log('Setting draw time for game:', d.gameID, 'to:', d.drawTime);
    const result = data.setDrawTime(d.gameID, d.drawTime);
    console.log('Result of setDrawTime:', result);
  });

  socket.on('getDrawTime', function(d) {
    const drawTime = data.getDrawTime(d.gameID);
    console.log('Returning draw time:', drawTime, 'for game:', d.gameID);
    socket.emit('selectedDrawTimeResponse', drawTime);
  });

  socket.on('setGameRounds', function(d){
    console.log('Setting rounds for game:', d.gameID, 'to:', d.gameRounds);
    const result = data.setGameRounds(d.gameID, d.gameRounds);
    console.log('Result of setGameRounds:', result);
  });

  socket.on('getGameRounds', function(d){
    const gameRounds = data.getGameRounds(d.gameID);
    console.log('Returning rounds:', gameRounds, 'for game:', d.gameID);
    socket.emit('selectedGameRounds', gameRounds);
  });

  socket.on('setTheme', function(d){
    console.log('Setting theme for game:', d.gameID, 'to:', d.theme);
    const result = data.setTheme(d.gameID, d.theme);
    console.log('Result of setTheme:', result);
  });

  socket.on('getTheme', function(d){
    const theme = data.getTheme(d.gameID);
    console.log('Returning theme:', theme, 'for game:', d.gameID);
    socket.emit('selectedTheme', theme);
  });


  socket.on('updateRound', function(d){
    console.log('Round updated')
    data.updateRound(d.gameID)
  });

  socket.on('getRound', function(d){
    socket.emit('currentRoundResponse', data.getRound(d.gameID))
  });

  socket.on('disconnect', () => {
    console.log(`Client with socket.id ${socket.id} disconnected.`);
  });


  socket.on('getGameData', (payload) => {
    const gameID = payload.gameID;
    const gameDataObj = data.getGameData(gameID); // Hämtar speldata
    if (gameDataObj) {
      console.log("Sending gameData to client:", gameDataObj);
      socket.emit('getGameData', gameDataObj); // Skickar speldata till klienten
    } else {
      console.error("Game data not found for gameID:", gameID);
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('startGame', function(gameID) {
    // Sänd till alla i gameCode-rummet att spelet startat
    io.to(gameID).emit('gameStarted');
  });

socket.on('chatMessage', (d) => {
  // data kan innehålla { gameID, username, text }
  // Spara meddelandet i chatHistoriken
  data.updateChatHistory(d.gameID, d.text, d.username);

  // Skicka ut uppdaterad chathistorik till alla i spelets rum
  io.to(d.gameID).emit('sendChatHistory', data.getChatHistory(d.gameID));
});


socket.on('drawing', (drawingData) => {
  const { gameID, ...drawData } = drawingData;
  data.addDrawing(gameID, drawData);
  socket.broadcast.to(gameID).emit('drawing', drawData);
});

socket.on('getDrawings', (gameID) => {
  const drawings = data.getDrawings(gameID);
  socket.emit('existingDrawings', drawings);
});

socket.on('clearCanvas', (gameID) => {
  data.clearDrawings(gameID);
  io.to(gameID).emit('clearCanvas');
});

socket.on('undo', () => {
  socket.broadcast.emit('undo');
});

socket.on('clearCanvas', () => {
  socket.broadcast.emit('clearCanvas');
});


socket.on('startTimer', function(data) {
  io.to(data.gameID).emit('timerStarted', data.time);
});

socket.on('wordSelected', function(d) {
  data.wordSelected(d.gameID, d.word);
  io.to(d.gameID).emit('selectedWord', data.getWordSelected(d.gameID));
});


socket.on('correctGuess', function(data) {
  // Skicka till alla deltagare att någon gissade rätt
  io.to(data.gameID).emit('correctGuessAnnouncement', {
    userID: data.userID,
    word: data.word
  });
});

socket.on("updateScores", (data) => {
  const { gameID, userScores } = data;

  // Skicka uppdaterade poäng till alla spelare i spelet
  io.to(gameID).emit("scoresUpdated", userScores);
});

}

export { sockets };