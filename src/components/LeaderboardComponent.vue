<template>
  <div class="leaderboard-container">
    <h2 class="leaderboard-title">{{ uiLabels.Leaderboard}}</h2>
    <div class="participants-grid">
      <!-- 
        Loopar över participants-objektet och använder userID som key,
        t.ex. participants = { "djV51_xxx": { name: "Kalle" }, ... }
      -->
      <div 
        v-for="(participant, userID) in participants"
        :key="userID"
        class="participant-card"
      >
        <div class="participant-name">{{ participant.name }}</div>
        <!-- 
          userScores hämtas nu med userID som nyckel.
          Om userScores[userID] inte finns (0/undefined), visas 0.
        -->
        <div class="participant-points">{{ uiLabels.Points }}: {{ userScores[userID] || 0 }}</div>
      </div>
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
    // participants är ett objekt { userID: { name: "..." }, ... }
    participants: {
      type: Object,
      required: true
    },
    // userScores är ett objekt { userID: number, ... }
    userScores: {
      type: Object,
      required: true
    }
    },
    created() {
      socket.on("uiLabels", labels => this.uiLabels = labels );
      socket.emit("getUILabels", this.lang );
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

@media (max-width: 768px) { 
  .participants-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 5 px;
  }
  .leaderboard-container {
    height: auto;
  }
  .participant-card {
  border-radius: 5px;
  padding: 5px;
  text-align: center;
  position: relative;
  transition: transform 0.3s ease;
}

.participant-name {
  font-size: 12px;
  margin-bottom: 5px;
  font-weight: bold;
}

.participant-points {
  font-size: 7px ;
  margin-bottom: 5px;
}
.leaderboard-title {
  font-size: 1rem;
  margin-bottom: 10px;
  margin-top: -5px;
  text-align: center;
  }

}

</style>