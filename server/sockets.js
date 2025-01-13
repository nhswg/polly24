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

    const scores = data.getScores(gameID);
    socket.emit('scoresUpdated', scores);
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
    console.log('Round updated');
    data.updateRound(d.gameID);
  });

  socket.on('getRound', function(d){
    socket.emit('currentRoundResponse', data.getRound(d.gameID));
  });

  socket.on('disconnect', () => {
    console.log(`Client with socket.id ${socket.id} disconnected.`);
  });

  socket.on('getGameData', (payload) => {
    const gameID = payload.gameID;
    const gameDataObj = data.getGameData(gameID);
    if (gameDataObj) {
      console.log("Sending gameData to client:", gameDataObj);
      socket.emit('getGameData', gameDataObj);
    } else {
      console.error("Game data not found for gameID:", gameID);
      socket.emit('error', { message: 'Game not found' });
    }
  });

  socket.on('startGame', function(gameID) {
    io.to(gameID).emit('gameStarted');
  });

  socket.on('chatMessage', (d) => {
    const game = data.getGameData(d.gameID);
    if (!game) return;

    if (game.participants[d.userID] && game.participants[d.userID].guessedCorrectly) {
      console.log(`${d.userID} har redan gissat rätt, ingen mer chatt...`);
      return;
    }
    data.updateChatHistory(d.gameID, d.text, d.username);
    io.to(d.gameID).emit('sendChatHistory', data.getChatHistory(d.gameID));
  });

  socket.on('drawing', (drawingData) => {
    const { gameID, ...drawData } = drawingData;
    data.addDrawing(gameID, drawData);
    socket.to(gameID).emit('drawing', drawData);
  });

  socket.on('getDrawings', (gameID) => {
    const drawings = data.getDrawings(gameID);
    socket.emit('existingDrawings', drawings);
  });

  socket.on('clearCanvas', function(gameID) {
    console.log('Socket.js: Received clearCanvas for game:', gameID);
    
    const cleared = data.clearCanvas(gameID);
    console.log('Socket.js: Canvas clear result:', cleared);
    
    if (cleared) {
        io.to(gameID).emit('canvasCleared');
        console.log('Socket.js: Emitted canvasCleared to room:', gameID);
    }
});

  socket.on('undo', (gameID) => {
    const updatedStrokes = data.undoLastStroke(gameID);
    io.to(gameID).emit('undoStroke', updatedStrokes);
  });

  socket.on('startTimer', function(data) {
    io.to(data.gameID).emit('timerStarted', data.time);
  });

  socket.on('wordSelected', function(d) {
    data.wordSelected(d.gameID, d.word);
    io.to(d.gameID).emit('selectedWord', data.getWordSelected(d.gameID));
  });

  socket.on("updateScores", (data) => {
    const { gameID, userScores } = data;
    io.to(gameID).emit("scoresUpdated", userScores);
  });

  socket.on('guessAttempt', (payload) => {
    const gameID = payload.gameID;
    const userID = payload.userID;
    const guess = payload.guess.trim().toLowerCase();
    const game = data.getGameData(gameID);

    if (!game) {
      console.error("Game not found");
      return;
    }

    if (game.participants[userID]?.guessedCorrectly) {
      console.log(`${payload.username} har redan gissat rätt tidigare.`);
      return;
    }

    const currentWord = game.currentWord.trim().toLowerCase();
    if (guess === currentWord) {
      if (!game.participants[userID]) {
        game.participants[userID] = { name: payload.username };
      }
      game.participants[userID].guessedCorrectly = true;

      const points = 5 * game.remainingTime;
      data.increaseScore(gameID, userID, points);
      game.participants[userID].pointsThisRound = points; 

      const updatedScores = data.getScores(gameID);
      io.to(gameID).emit("scoresUpdated", updatedScores);

      io.to(gameID).emit('correctGuessAnnouncement', {
        userID,
        username: payload.username,
        word: game.currentWord
      });

      const systemMessage = `${payload.username} guessed correctly!`;
      data.updateChatHistory(gameID, systemMessage, '');

      io.to(gameID).emit('sendChatHistory', data.getChatHistory(gameID));
    } else {
        data.updateChatHistory(gameID, payload.guess, payload.username);
        io.to(gameID).emit('sendChatHistory', data.getChatHistory(gameID));
    }
  });

  socket.on("resetGuesses", (gameID) => {
    data.resetGuesses(gameID);
  });

  socket.on("clearChat", (gameID) => {
    data.clearChatHistory(gameID);
    io.to(gameID).emit("sendChatHistory", data.getChatHistory(gameID));
  });

  socket.on('leaveGame', function(d) {
    data.removeParticipant(d.gameID, d.userID);
    io.to(d.gameID).emit('participantsUpdate', data.getParticipants(d.gameID));
  });

  const gameTimers = {};
 
  socket.on('startGameTimer', ({ gameID, duration }) => {
    if (gameTimers[gameID]) {
      console.log('Timer already running for game:', gameID);
      return;
    }

    let remainingTime = duration;
    let hasTriggeredEarly = false;

    gameTimers[gameID] = setInterval(() => {
      const game = data.getGameData(gameID);
      if (!game) {
        clearInterval(gameTimers[gameID]);
        delete gameTimers[gameID];
        return;
      }

      const participants = Object.entries(game.participants);
      const drawer = participants[game.currentDrawerIndex]?.[0];

      if (remainingTime > 0) {
        const nonDrawingPlayers = participants.filter(([userID]) => userID !== drawer);
        const allGuessedCorrectly = nonDrawingPlayers.length > 0 && 
        nonDrawingPlayers.every(([_, p]) => p.guessedCorrectly);
        if (allGuessedCorrectly && remainingTime > 1 && !hasTriggeredEarly) {
          remainingTime = 1;
          hasTriggeredEarly = true;
        }
        remainingTime--;
        game.remainingTime = remainingTime;
        io.to(gameID).emit('timerUpdate', { remainingTime });

      } else {
        clearInterval(gameTimers[gameID]);
        delete gameTimers[gameID];
        const cleared = data.clearCanvas(gameID);
        if (cleared) {
          io.to(gameID).emit('canvasCleared');
        }

        data.clearChatHistory(gameID);
        io.to(gameID).emit('clearChat');
        io.to(gameID).emit('timerFinished', { gameID });
        data.clearChatHistory(gameID);
        io.to(gameID).emit('clearChat');
        io.to(gameID).emit('timerFinished', { gameID });

        const game = data.getGameData(gameID);
        if (!game) return;

        const participantIDs = Object.keys(game.participants || {});
        if (!participantIDs.length) return;

        const currentDrawer = participantIDs[game.currentDrawerIndex];

        const guessers = participantIDs.filter(uid => game.participants[uid].guessedCorrectly);
        const totalPoints = guessers.reduce((sum, uid) => sum + (game.participants[uid].pointsThisRound || 0), 0);
        const averagePoints = guessers.length ? Math.floor(totalPoints / guessers.length) : 0;
        data.increaseScore(gameID, currentDrawer, averagePoints);

        game.participants[currentDrawer].pointsThisRound = averagePoints;
        io.to(gameID).emit('scoresUpdated', data.getScores(gameID));
        guessers.forEach(uid => { game.participants[uid].pointsThisRound = 0; });


        if (!game.playersDrawnThisRound.includes(currentDrawer)) {
          game.playersDrawnThisRound.push(currentDrawer);
        }

        game.currentDrawerIndex = (game.currentDrawerIndex + 1) % participantIDs.length;

        if (game.playersDrawnThisRound.length === participantIDs.length) {
          game.currentRound++;
          data.resetPlayersDrawn(gameID);
        }

        data.resetGuesses(gameID);
        data.clearChatHistory(gameID);
        game.currentWord = "";
        io.to(gameID).emit('getGameData', game);
      }
    }, 1000);
  });

  socket.on('stopGameTimer', (gameID) => {
    if (gameTimers[gameID]) {
      clearInterval(gameTimers[gameID]);
      delete gameTimers[gameID];
      io.to(gameID).emit('timerStopped', {gameID});
    }
  });

  socket.on('getRemainingTime', (gameID) => {
    if (gameTimers[gameID]) {
      const remainingTime = gameTimers[gameID].remainingTime;
      socket.emit('timerUpdate', {remainingTime});
    } else {
      socket.emit('timerUpdate', {remainingTime: 0});
    }
  });
}
export { sockets };