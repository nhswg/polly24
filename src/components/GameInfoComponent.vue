<template>
    <div class="information-banner">
      <button class="leave" @click="confirmLeave">{{ uiLabels.leaveGame }}</button>
  
      <div v-if="wordOptions.length > 0" class="word-options">
        <p>{{ uiLabels.chooseWord }}:</p>
        <button v-for="word in wordOptions" :key="word" @click="$emit('select-word', word)">
          {{ word }}
        </button>
      </div>
      <div v-else class="current-word">
        {{ currentWord }}
      </div>
  
      <div class="timer-container">
        <img src="/img/clock1.png" alt="Clock" class="clock-image">
        <div class="timer-text">{{ timer }}</div>
      </div>
      <div class="round-container">
        <img src="/img/round1.png" alt="Round" class="round-image">
        <div class="round-text">{{ currentRound }}</div>
      </div>
    </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("http://localhost:3000");

  export default {
    data () {
      return {
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      }
    },
    props: {
      wordOptions: {
        type: Array,
        default: () => []
      },
      currentWord: {
        type: String,
        default: ''
      },
      timer: {
        type: Number,
        default: 0
      },
      currentRound: {
        type: Number,
        default: 1
      }
    },
    methods: {
      confirmLeave() {
        if (confirm("Är du säker på att du vill lämna spelet?")) {
          this.$emit('leave-game');
        }
      }
    },
    created() {
      socket.on("uiLabels", labels => this.uiLabels = labels );
      socket.emit("getUILabels", this.lang );
    }
  }
  </script>
  
  <style scoped>
  .information-banner{
    display: grid;
    grid-template-columns: 2fr 6fr 1fr 1fr;
    height: 80px;
    background-color: #f0f0f0;
    margin-top: 10px;
    margin-bottom: 10px;
    border-radius: 5px;
  }
  
  .current-word {
    flex: 1;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
    margin-top: 25px;
  }
  
  .leave{
    width: 150px;
    height: 40px;
    font-size: 1.5rem;
    background-color: #d70000;
    color:white;
    border-radius: 5px;
    margin-left: 50px;
    margin-top: 20px;
  }
  
  .timer-container {
    position: relative;
    width: 100px;
    height: 100px; 
  }
  
  .clock-image {
    width: 80%;
    height: auto;
  }
  
  .timer-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;    
    color: black;   
    font-weight: bold;
  }
  
  .round-container {
    position: relative;
    width: 100px;  
    height: 100px;
  }
  
  .round-image {
    width: 80%;
    height: auto;
  }
  
  .round-text {
    position: absolute;
    top: 47%;
    left: 47%;
    transform: translate(-50%, -50%);
    font-size: 20px;    
    font-weight: bold;
  }
  
  .word-options {
    text-align: center;
    margin: 10px 0;
    z-index: 1000;
    margin-top: 300px;
  }
  
  .word-options button {
    margin-top: 100px;
    margin: 5px;
    padding: 10px 15px;
    font-size: 16px;
    cursor: pointer;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  
  .word-options button:hover {
    background-color: #e0e0e0;
  } 

  @media (max-width: 768px) {
    .information-banner{
    height: 50px;
    width: 100%;
    margin-top: 10px;
    margin-bottom: 0px;
  }
  
  .current-word {
    flex: 1;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    margin-top: 10px;
  }
  
  .timer-container {
    padding-top: 5px;
    width: 40px;
    height: 40px; 
  }
  
  .clock-image {
    width: 100%;
    height: auto;
  }
  
  .timer-text {
    padding-top: 7px;
    font-size: 14px; /* Adjusted font size for mobile */
  }
  
  .round-container {
    padding-top: 0px;
    width: 50px;  
    height: 60px;
  }
  
  .round-image {
    width: 100%;
    height: auto;
  }
  
  .round-text {
    font-size: 14px; 
  }
  
  .word-options {
    text-align: center;
    margin: 10px 0;
    z-index: 100;
    margin-top: 90px; /* Adjusted margin for mobile */
  }
  
  .word-options button {
    margin: 5px;
    padding: 2px 5px;
    font-size: 14px; /* Adjusted font size for mobile */
    cursor: pointer;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
    width: 80%; /* Full width button on mobile */
  }

  .leave {
    font-size: 0.7rem; 
    padding: 3px 5px;
    margin-left: 5px; 
    margin-top: 5px;
    width: auto; 
    height: 40px; 
    }

  
  }
  </style>