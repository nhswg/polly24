<template>
  <div class="sketchdle-container">
    <header>
        <button class="title-button" @click="handleLeaveGame">
          ← 
        </button>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container" @click="switchLanguage">
        <img src="/img/flag.png" alt="Change Language">
      </button>
    </header>
    <div class="header-line"></div>
    
    <main class="lobby-content">
      <div class="waiting-lobby">
        <p>
          {{ uiLabels.waitingForHost }}
          <span class="loading-dots">
            <span class="dot">.</span>
            <span class="dot">.</span>
            <span class="dot">.</span>
          </span>
        </p>
      </div>
      
      <div class="game-info">
        <div class="display-gamecode">
          {{ uiLabels.gameCode }}: 
          <span class="code-highlight">{{ gameID }}</span>
        </div>
        
        <div class="participants-container">
          <h2 class="participants-title">{{ uiLabels.participantLabel }}</h2>
          <div class="participants-grid">
            <div 
              v-for="(participant, index) in gameData.participants" 
              :key="participant.name"
              class="participant-card"
            >
              <span class="participant-number">#{{ index + 1 }}</span>
              {{ participant.name }}
            </div>
          </div>
        </div>

        <div class="game-rules-container" v-if="gameData">
          <h2>{{ uiLabels.gameRules }}:</h2>
          <div class="simple-rules">
            <div class="rule-row">{{ uiLabels.Language }}: {{ gameData.wordsLanguage }}</div>
            <div class="rule-row">{{ uiLabels.Drawtime }}: {{ gameData.drawTime }} {{ uiLabels.Seconds }}</div>
            <div class="rule-row">{{ uiLabels.Rounds }}: {{ gameData.gameRounds }}</div>
            <div class="rule-row">{{ uiLabels.Theme }}: {{ gameData.theme }}</div>
          </div>
        </div>
      </div>

      <button 
        v-if="this.isAdmin && Object.keys(gameData.participants).length > 1"
        @click="startGame" 
        @keyup.enter="startGame"
        class="start-game-button"
      >
        {{uiLabels.startGame}}
      </button>
      <p v-if="this.isAdmin && Object.keys(gameData.participants).length < 2" class="player-warning">
      {{uiLabels.minimumPlayers}}     
     </p>
    </main>
  </div>
</template>
  
<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'WaitingRoom',
  data() {
    return {
      uiLabels: {},
      isAdmin: false,
      gameID: '',
      userID: '',
      gameData: {},
      lang: localStorage.getItem("lang") || "en",
    };
  },
  created() {
    this.gameID = this.$route.params.id;
    this.userID = this.$route.params.userID;

    // Hämta UI-etiketter
    socket.on("uiLabels", (labels) => (this.uiLabels = labels));
    socket.emit("getUILabels", this.lang);

    // Hämta speldata
    socket.emit("getGameData", { gameID: this.gameID });
    socket.on("getGameData", (gameData) => {
      this.gameData = gameData;
      this.adminID = gameData.adminID;
      this.isAdmin = this.userID === this.adminID;
      console.log(this.isAdmin)
    });
    
    socket.on("participantsUpdate", (participants) => {
      this.gameData.participants = participants; 
      console.log("new player joined")
    });

    socket.on("gameStarted", () => {
      this.$router.push(`/game/${this.gameID}/${this.userID}`);
    });

    socket.emit("joinGame", this.gameID);

    window.addEventListener("keydown", this.handleEnterKey);
  },

  beforeDestroy() {
    window.removeEventListener("keydown", this.handleEnterKey);
  },
  
  methods: {
    startGame() {
        socket.emit("startGame", this.gameID);
    },
    switchLanguage() {
      this.lang = this.lang === "en" ? "sv" : "en";
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    },

    handleEnterKey(event) {
    if (
      event.key === "Enter" &&
      this.isAdmin &&
      Object.keys(this.gameData.participants).length > 1
    ) {
      this.startGame();
    }
  },
  handleLeaveGame() {
      socket.emit('leaveGame', { gameID: this.gameID, userID: this.userID });
      socket.disconnect();
      window.location.href = '/';
    },
  },
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

@media (max-width: 600px) {
  .game-info {
    margin-top: 20px;
  }

  .display-gamecode {
    font-size: 1.8rem; 
    margin-bottom: 20px;
  }

  .participants-container {
    width: 90%; 
    padding: 10px;
    margin-bottom: 20px;
  }

  .participants-title {
    font-size: 1.5rem; 
    margin-bottom: 10px;
  }

  .participants-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); 
    gap: 10px; 
  }

  .participant-card {
    padding: 5px;
  }

  .participant-number {
    font-size: 0.7rem; 
  }

  .start-game-button {
    width: 50%; 
    height: 45px;
    font-size: 1.3rem;
    margin-top: 15px;
  }

  .player-warning {
    font-size: 1rem;
    margin-top: 10px;
  }
}

.game-rules-container {
  max-width: 300px;
  margin: 20px auto;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.game-rules-container h2 {
  font-size: 1.3rem;
  margin-bottom: 10px;
  color: #444;
}

.rule {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rule h3 {
  flex: 1;
  color: #0b3866;
  text-align: left;
  font-size: 1.4rem;
  border-bottom: 2px solid #ddd;
}

.rule span {
  text-align: right;
  width: 35%;
  font-size: 1.2rem;
}

@media (max-width: 600px) {
  .game-rules-container {
    max-width: 250px;
    margin: 15px auto;
  }

  .game-rules-container h2 {
    font-size: 1.5rem;
  }

  .rule {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .rule h3 {
    font-size: 1rem;
    width: 60%;
  }

  .rule span {
    width: 100%;
    font-size: 1rem;
  }
}

.simple-rules {
  text-align: left;
}

.rule-row {
  padding: 5px 0;
  font-size: 1.1rem;
  color: #333;
}

@media (max-width: 600px) {
  .rule-row {
    font-size: 0.9rem;
  }
}
</style>