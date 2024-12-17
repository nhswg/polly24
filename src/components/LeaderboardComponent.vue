<template>
  <div class="leaderboard">
    <p>Leaderboard</p>
    <div class="participant" v-for="participant in participants" :key="participant.name">
      <div class="participant-name">{{ participant.name }}</div>
      <div class="participant-points">Points: {{ userScores[participant.name] }} </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    props: {
      participants: {
        type: Array,
        required: true
      },
      userScores: {
      type: Object,
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
  .leaderboard > p {
    padding-bottom: 30px;
    border-bottom: 0.5px solid gray;
  }
  .participant {
    border-bottom: 0.5px solid gray;
    padding-bottom: 10px;
   
  }
  .participant-name {
    margin-bottom: 5px;
    font-weight: bold;
  }
  .participant-points {
    font-weight: bold;
    font-size: 10px;
    margin-bottom: 5px;

  }
  </style>