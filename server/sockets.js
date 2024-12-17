

  function sockets(io, socket, data) {
    
    socket.on('getUILabels', function(lang) {
      socket.emit('uiLabels', data.getUILabels(lang));
    });

    socket.on('createPoll', function(d) {
      data.createPoll(d.pollId, d.lang)
      socket.emit('pollData', data.getPoll(d.pollId));
    });

    socket.on('addQuestion', function(d) {
      data.addQuestion(d.pollId, {q: d.q, a: d.a});
      socket.emit('questionUpdate', data.activateQuestion(d.pollId));
    });

    socket.on('joinGame', function(gameCode) {
      console.log('joinGame', gameCode);
      socket.join(gameCode);
      const participants = data.getParticipants(gameCode);
      console.log('participants', participants);
      socket.emit('participantsUpdate', participants);
    });

    socket.on('participateInGame', function(d) {
      data.participateInGame(d.gameCode, d.userID, d.name);
      io.to(d.gameCode).emit('participantsUpdate', data.getParticipants(d.gameCode));
    });

    socket.on('startPoll', function(pollId) {
      io.to(pollId).emit('startPoll');
    })
    socket.on('runQuestion', function(d) {
      let question = data.activateQuestion(d.pollId, d.questionNumber);
      io.to(d.pollId).emit('questionUpdate', question);
      io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
    });

    socket.on('submitAnswer', function(d) {
      data.submitAnswer(d.pollId, d.answer);
      io.to(d.pollId).emit('submittedAnswersUpdate', data.getSubmittedAnswers(d.pollId));
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

  socket.on('startTimer', function(data) {
    io.to(data.gameCode).emit('timerStarted', data.time);
  });
  
  }

  export { sockets };