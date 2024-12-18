function sockets(io, socket, data) {
    
    socket.on('getUILabels', function(lang) {
      socket.emit('uiLabels', data.getUILabels(lang));
    });

    socket.on('joinGame', function(gameCode) {
      console.log('joinGame', gameCode);
      socket.join(gameCode);
      const participants = data.getParticipants(gameCode);
      console.log('participants', participants);
      socket.emit('participantsUpdate', participants);
      socket.emit('selectedWord', data.getWordSelected(gameCode)); // in i  GET join game för att få ordet som valts av gamecoden endast
    });

    socket.on('participateInGame', function(d) {
      data.participateInGame(d.gameCode, d.userID, d.name);
      io.to(d.gameCode).emit('participantsUpdate', data.getParticipants(d.gameCode));
    });

    /*Nedan är nya sockets*/

    socket.on('createGame', function(gameData) {
      // Lagra gameData
      data.createGame(gameData);
      // Låt socket ansluta till spelrummet
      socket.join(gameData.gameId);
      // Skicka 'gameCreated' tillbaka till skaparen
      socket.emit('gameCreated', gameData);
      // MåSTe fixa så man läser in gameData från databasen
    });

   socket.on('getGameData', function(payload) {
    const gameCode = payload.gameCode;
    const gameDataObj = data.getPoll(gameCode); // eller data.getGameData(gameId) om du har en sådan metod
    if (gameDataObj) {
      socket.join(gameCode);
      socket.emit('gameData', gameDataObj);
    } else {
      socket.emit('error', { message: 'Spelet hittades inte' });
    }
  });

    socket.on('startGame', function(gameCode) {
      // Sänd till alla i gameCode-rummet att spelet startat
      io.to(gameCode).emit('gameStarted');
    });

  socket.on('chatMessage', (data) => {
  // data kan innehålla {gameCode, username, text}
  // Sänd tillbaka meddelandet till alla i spelets rum
  io.to(data.gameCode).emit('chatMessage', data);
  });

  socket.on('drawing', (drawingData) => {
    socket.broadcast.emit('drawing', drawingData);
  });

  socket.on('undo', () => {
    socket.broadcast.emit('undo');
  });

  socket.on('clearCanvas', () => {
    socket.broadcast.emit('clearCanvas');
  });


  socket.on('startTimer', function(data) {
    io.to(data.gameCode).emit('timerStarted', data.time);
  });

  socket.on('wordSelected', function(d) {
    data.wordSelected(d.gameCode, d.word);
    io.to(d.gameCode).emit('selectedWord', data.getWordSelected(d.gameCode)); //parameter 1 =  nytt ord, parameter 2 = ordet som valts från databasen

  });
  socket.on('correctGuess', function(data) {
    // Skicka till alla deltagare att någon gissade rätt
    io.to(data.gameCode).emit('correctGuessAnnouncement', {
      username: data.username,
      word: data.word
    });
  });
  
  socket.on("updateScores", (data) => {
    const { gameCode, userScores } = data;
  
    // Skicka uppdaterade poäng till alla spelare i spelet
    io.to(gameCode).emit("scoresUpdated", userScores);
  });
  
  }

  export { sockets };