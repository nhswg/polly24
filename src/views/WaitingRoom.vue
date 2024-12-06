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
      gameCode: '',
      participants: [],
      isAdmin: false,
    };
  },
  created() {
    // Hämta sparad information
    this.gameCode = localStorage.getItem('gameId');
    this.isAdmin = localStorage.getItem('isAdmin') === 'true';
    
    // Lyssna på uppdateringar av deltagarlistan
    socket.on("participantsUpdated", (participants) => {
      this.participants = participants;
    });
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
  