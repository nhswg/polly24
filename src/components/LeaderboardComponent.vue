<template>
    <div class="leaderboard">
      <p>Leaderboard</p><br>
      <div class="participant-name" v-for="participant in participants" :key="participant.name">
        {{ participant.name }}
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      participants: {
        type: Array,
        required: true
      }
    }
  }
  </script>
  
  <style scoped>
  .leaderboard {
    background-color: #f0f0f0;
    border-radius: 5px;
  }
  .participant-name {
    margin-bottom: 5px;
  }
  </style>