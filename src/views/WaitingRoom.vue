<template>
    <div class="waiting-lobby">
      <p>
        Waiting for host to start game
        <span class="dots">
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        </span>
      </p>
    </div>
    <div class="display-gamecode">
      Game code: {{ gameCode }}
    </div>
  
    <p class="participants-title">Participants:</p>
      <div class="participants-square">
        <div class="participants-item" v-for="participant in participants" :key="participant">
          {{ participant.name }}
        </div>
      </div> 

    <button 
      v-if="isAdmin" 
      @click="startGame" 
      class="start-game-button"
    >
      Start Game
    </button>
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
    // Hämta sparad information
    this.gameCode = localStorage.getItem('gameId');
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
    });
    socket.emit("joinGame", this.gameCode);
    
  },
  methods: {
    startGame() {
      if (this.isAdmin) {
        socket.emit("startGame", this.gameCode);
        this.$router.push(`/game/${this.gameCode}`);
      }
    }
  }
};
</script>
  
  <style scoped>
  .waiting-lobby {
    margin-top: 50px;
    font-size: 2rem;
    text-align: center;
  }
  
  .dots {
    display: inline-block;
  }
  
  .dot {
    display: inline-block;
    font-size: 2rem;
    animation: bounce 1.5s infinite;
  }
  
  .dot:nth-child(1) {
    animation-delay: 0s;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  .participants-title {
  font-size: 1.5rem;
  margin-top: 30px;
  margin-bottom: 5px; 
  color: black;
}

.participants-square {
  width: 600px;
  height: 300px;
  margin: 0 auto;
  background-color: white;
  border: 2px solid black;
  border-radius: 10px;
  margin-bottom: 40px;
  font-size: 1.5rem;

}
.participants-item {
  background-color: white;
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

.display-gamecode {
  font-size: 3rem;
}



  
  /* Keyframes för "hoppa upp och ner"-effekt */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0); /* Ursprungsläge */
    }
    50% {
      transform: translateY(-5px); /* Hoppa upp */
    }
  }
  </style>
  

