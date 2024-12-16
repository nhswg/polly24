<template>
    <div class="information-banner">
      <button class="leave" @click="confirmLeave">Leave game</button>
  
      <div v-if="wordOptions.length > 0" class="word-options">
        <p>Choose a word:</p>
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
  export default {
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
    }
  }
  </script>
  
  <style scoped>
  .information-banner{
    display: grid;
    grid-template-columns: 2fr 6fr 1fr 1fr;
    height: 80px;
  }
  
  .current-word {
    flex: 1;
    text-align: center;
    font-size: 24px;
    font-weight: bold;
  }
  
  .leave{
    width: 150px;
    height: 50px;
    font-size: 1.5rem;
    background-color: #dc3545;
    color:black;
    border: solid 1px black;
    border-radius: 5px;
    margin-top: 15px;
    margin-left: 50px;
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
    top: 43%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 20px;    
    color: black;   
    font-weight: bold;
  }
  
  .round-container {
    position: relative;
    width: 100px;  
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
  </style>