<template>
  <div class="sketchdle-container">
    <header>
      <router-link to="/" class="back-link">
        <button class="title-button">
          ← 
        </button>
      </router-link>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container" @click="switchLanguage">
        <img src="/img/flag.png" alt="Change Language">
      </button>
    </header>
    <div class="header-line"></div>
    
    <main class="lobby-content">
      <div class="waiting-lobby">
        <p>
          Waiting for host to start game
          <span class="loading-dots">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </span>
        </p>
      </div>
      
      <div class="game-info">
        <div class="display-gamecode">
          Game Code: 
          <span class="code-highlight">{{ gameCode }}</span>
        </div>
        
        <div class="participants-container">
          <h2 class="participants-title">Participants</h2>
          <div class="participants-grid">
            <div 
              v-for="(participant, index) in participants" 
              :key="participant.name" 
              class="participant-card"
            >
              <span class="participant-number">#{{ index + 1 }}</span>
              {{ participant.name }}
            </div>
          </div>
        </div>
      </div>

      <button 
        v-if="isAdmin && participants.length > 1" 
        @click="startGame" 
        class="start-game-button"
        :disabled="participants.length < 2"
      >
        Start Game
      </button>
      <p v-if="isAdmin && participants.length < 2" class="player-warning">
        Needs at least 2 players to start
      </p>
    </main>
  </div>
</template>
  
<script>
import io from 'socket.io-client';
const socket = io("http://localhost:3000");

export default {
  name: 'WaitingRoom',
  data() {
    return {
      username: '',
      gameCode: '',
      participants: [],
      isAdmin: false,
    };
  },
  created() {
    this.gameCode = localStorage.getItem('gameId');
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
    });
    
    socket.on("gameStarted", () => {
      this.$router.push(`/game/${this.gameCode}`);
    });
    
    socket.emit("joinGame", this.gameCode);
  },
  methods: {
    startGame() {
      if (this.participants.length >= 2) {
        socket.emit("startGame", this.gameCode);
      }
    },
    switchLanguage() {
      // Placeholder for language switch functionality
      console.log('Switch language');
    }
  }
};
</script>
  
<style scoped>

.loading-dots {
  display: inline-block;
  margin-left: 10px;
}

.dot {
  display: inline-block;
  font-size: 2rem;
  animation: bounce 1.5s infinite;
}

.dot:nth-child(1) { animation-delay: 0s; }
.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

.game-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 30px;
}

.display-gamecode {
  font-size: 2.5rem;
  margin-bottom: 30px;
  color: #333;
}

.code-highlight {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 5px;
  color: #333;
}

.participants-container {
  width: 100%;
  max-width: 600px;
  background-color: #f9f9f9;
  border: 2px solid #ddd;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 30px;
}

.participants-title {
  font-size: 2.5rem;
  margin-bottom: 20px;
  margin-top: -10px;
  text-align: center;
  color: #333;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 15px;
}

.participant-card {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  text-align: center;
  position: relative;
  transition: transform 0.3s ease;
}

.participant-card:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.participant-number {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 0.8rem;
  color: #888;
}

.start-game-button {
  width: 150px;
  height: 50px;
  font-size: 1.5rem;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 20px;
}
.start-game-button:hover {
  background-color: #218838;
}

.player-warning {
  color: #dc3545;
  text-align: center;
  margin-top: 15px;
  font-size: 1.2rem;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}
</style>