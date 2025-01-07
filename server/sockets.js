import io from 'socket.io-client';
export const socket = io('http://localhost:3000');

function sockets(io, socket, data) {
  // Övriga socket.on-lyssnare
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

    // Skicka även nuvarande poäng direkt vid join
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
    io.to(gameID).emit('gameStarted');
  });

  //
  // CHATTEN: Om användaren redan gissat rätt, ignorera meddelandet
  //
  socket.on('chatMessage', (d) => {
    // d kan innehålla { gameID, userID, username, text }
    const game = data.getGameData(d.gameID);
    if (!game) return;

    // Kolla om användaren redan är markerad som "guessedCorrectly"
    if (game.participants[d.userID] && game.participants[d.userID].guessedCorrectly) {
      console.log(`${d.userID} har redan gissat rätt, ingen mer chatt...`);
      return;
    }

    // Spara meddelandet i chatHistoriken
    data.updateChatHistory(d.gameID, d.text, d.username);

    // Skicka ut uppdaterad chathistorik till alla i spelets rum
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

socket.on('clearCanvas', (gameID) => {
  data.clearDrawings(gameID);
  io.to(gameID).emit('clearCanvas');
});

socket.on('undo', () => {
  socket.broadcast.emit('undo');
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

  //
  // GISSNINGSLOGIK
  //
  socket.on('guessAttempt', (payload) => {
    const gameID = payload.gameID;
    const userID = payload.userID;
    const guess = payload.guess.trim().toLowerCase();
    
    const game = data.getGameData(gameID);
    if (!game) {
      console.error("Game not found");
      return;
    }

    // Om användaren redan markerats guessedCorrectly => ignorera
    if (game.participants[userID]?.guessedCorrectly) {
      console.log(`${payload.username} har redan gissat rätt tidigare.`);
      return;
    }

    // Jämför gissning med currentWord
    const currentWord = game.currentWord.trim().toLowerCase();
    if (guess === currentWord) {
      console.log(`Korrekt gissning av ${payload.username}`);

      // Markera användaren som "har gissat rätt" i participants
      if (!game.participants[userID]) {
        game.participants[userID] = { name: payload.username };
      }
      game.participants[userID].guessedCorrectly = true;
    
      // Öka poäng på serversidan
      data.increaseScore(gameID, userID, 1);

      // Hämta uppdaterad poängtabell och skicka till alla i spelet
      const updatedScores = data.getScores(gameID);
      io.to(gameID).emit("scoresUpdated", updatedScores);

      // Skicka "rätt gissning"-notis
      io.to(gameID).emit('correctGuessAnnouncement', {
        userID,
        username: payload.username,
        word: game.currentWord
      });

      // Lägg till systemmeddelande i chatten
      const systemMessage = `${payload.username} guessed correctly!`;
      data.updateChatHistory(gameID, systemMessage, '');

      // Skicka ut hela chatHistoriken
      io.to(gameID).emit('sendChatHistory', data.getChatHistory(gameID));
    } else {
      // Fel gissning => behandla som "chatMessage"
      data.updateChatHistory(gameID, payload.guess, payload.username);
      io.to(gameID).emit('sendChatHistory', data.getChatHistory(gameID));
    }
  });

  socket.on("resetGuesses", (gameID) => {
    data.resetGuesses(gameID);  // <-- Anropa vår nya metod
  });

  socket.on("clearChat", (gameID) => {
    data.clearChatHistory(gameID);
  
    // Skicka tom chat till alla
    io.to(gameID).emit("sendChatHistory", data.getChatHistory(gameID));
  });

  socket.on('leaveGame', function(d) {
    data.removeParticipant(d.gameID, d.userID);
    io.to(d.gameID).emit('participantsUpdate', data.getParticipants(d.gameID));
  });

  const gameTimers = {};
  
  socket.on('startGameTimer', ({ gameID, duration }) => {
    console.log('Starting game timer for game:', {gameID}, 'with duration:',  {duration});

    if (gameTimers[gameID]) {
      console.log('Timer already running for game:', gameID);
      return;
    }

    let remainingTime = duration;

    gameTimers[gameID] = setInterval(() => {
      if (remainingTime > 0) {
        remainingTime--;

        io.to(gameID).emit('timerUpdate', {remainingTime});
        //console.log('Timer update:', remainingTime);
      } else { 
        clearInterval(gameTimers[gameID]);
        delete gameTimers[gameID];
        io.to(gameID).emit('timerFinished', { gameID });
        //console.log('Timer finished for game:', gameID);
      }
    }, 1000);
  });

  socket.on('stopGameTimer', (gameID) => {
   if (gameTimers[gameID]) {
      clearInterval(gameTimers[gameID]);
      delete gameTimers[gameID];
      //console.log('Timer stopped for game:', gameID);
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

// Exportera funktionen
export { sockets };