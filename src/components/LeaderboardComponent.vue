<template>
  <div class="leaderboard-container">
    <h2 class="leaderboard-title">Leaderboard</h2>
    <div class="participants-grid">
      <div 
        v-for="(participant, index) in participants"
        :key="participant.name"
        class="participant-card"
      >
        <div class="participant-name">{{ participant.name }}</div>
        <div class="participant-points">Points: {{ userScores[participant.name] }}</div>
      </div>
    </div>
  </div>
</template>
  
  <script>
  export default {
    props: {
      participants: {
        type: [Array, Object],
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

.leaderboard-container {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 30px;
  height: 580px;
  overflow-y: auto;
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
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
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

.participant-number {
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 0.8rem;
  color: #888;
}
.participant-name {
  margin-bottom: 5px;
  font-weight: bold;
}
.participant-points {
  font-size: 10px;
  margin-bottom: 5px;
}
</style>