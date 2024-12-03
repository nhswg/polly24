<template>
    <div class="admin-lobby">
      <h1>Admin Lobby</h1>
      <h2>Game Code: {{ gameData.gameId }}</h2>
      <ul class="settings-list">
        <li><strong>Language:</strong> {{ gameData.language }}</li>
        <li><strong>Drawtime:</strong> {{ gameData.drawTime }} seconds</li>
        <li><strong>Rounds:</strong> {{ gameData.rounds }}</li>
        <li><strong>Theme:</strong> {{ gameData.theme }}</li>
      </ul>
      <h2>Participants</h2>
      <ul class="participants-list">
        <li v-for="participant in participants" :key="participant.id">
          {{ participant.name }}
        </li>
      </ul>
      <button @click="startGame" class="start-game-button">
        Start Game
      </button>
    </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("http://localhost:3000");
  
  export default {
    data() {
      return {
        gameData: {}, // Spelinställningar
        participants: [], // Lista över deltagare
      };
    },
    created() {
      socket.on('gameData', (data) => {
        this.gameData = data;
      });
      socket.on("participantsUpdate", (participants) => {
        this.participants = participants;
      });
      // Begär speldata från servern
      socket.emit("getGameData", { gameId: localStorage.getItem("gameId") });
    },
    methods: {
      startGame() {
        socket.emit("startGame", { gameId: this.gameData.gameId });
      },
    },
  };
  </script>
  
  
  <style scoped>
  .admin-lobby {
    text-align: center;
    font-family: Arial, sans-serif;
  }
  .settings-list {
    list-style: none;
    padding: 0;
  }
  .settings-list li {
    margin: 10px 0;
    font-size: 1.2rem;
  }
  .participants-list {
    list-style: none;
    padding: 0;
    margin-top: 20px;
  }
  .participants-list li {
    margin: 5px 0;
    font-size: 1rem;
  }
  .start-game-button {
    padding: 15px 30px;
    font-size: 1.5rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-top: 20px;
  }
  .start-game-button:hover {
    background-color: #218838;
  }
  </style>
  