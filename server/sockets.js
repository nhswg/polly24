const games = {};

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

    socket.on('joinPoll', function(pollId) {
      socket.join(pollId);
      socket.emit('questionUpdate', data.activateQuestion(pollId))
      socket.emit('submittedAnswersUpdate', data.getSubmittedAnswers(pollId));
    });

    socket.on('participateInPoll', function(d) {
      data.participateInPoll(d.pollId, d.name);
      io.to(d.pollId).emit('participantsUpdate', data.getParticipants(d.pollId));
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
      games[gameData.gameId] = gameData;
      // Låt socket ansluta till spelrummet
      socket.join(gameData.gameId);
      // Skicka 'gameCreated' tillbaka till skaparen
      socket.emit('gameCreated', gameData);
    });
  
    socket.on('getGameData', function(data) {
      const gameId = data.gameId;
      const gameData = games[gameId];
      if (gameData) {
        socket.join(gameId); // Anslut till rummet
        socket.emit('gameData', gameData);
      } else {
        socket.emit('error', { message: 'Spelet hittades inte' });
      }
    });
  }

  export { sockets };