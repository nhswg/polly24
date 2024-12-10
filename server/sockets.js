

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
      socket.join(gameCode);
      socket.emit('participantsUpdate', data.getParticipants(gameCode));
    });

    socket.on('participateInGame', function(d) {
      data.participateInGame(d.gameCode, d.name);
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
  
    socket.on('getGameData', function(data) {
      const gameId = data.gameId;
      const gameData = data.getGameData(gameId);
      if (gameData) {
        socket.join(gameId); // Anslut till rummet
        socket.emit('gameData', gameData);
      } else {
        socket.emit('error', { message: 'Spelet hittades inte' });
      }
    });
  }

  export { sockets };