<template>
    <div class="leaderboard-container">
      <h2 class="leaderboard-title">
        <span class="trophy">🏆</span>
        {{ uiLabels.Leaderboard }}
        <span class="trophy">🏆</span>
      </h2>
      <div class="participants-grid">
        <div 
          v-for="(participant, index) in sortedParticipants"
          :key="participant.id"
          :class="[
            'participant-card',
            { 
              'winner': index === 0,
              'second': index === 1,
              'third': index === 2
            }
          ]"
        >
          <div class="medal" v-if="index === 0">🥇</div>
          <div class="medal" v-else-if="index === 1">🥈</div>
          <div class="medal" v-else-if="index === 2">🥉</div>
          <div class="position"> {{ index + 1 }}</div>
          <div class="participant-name">{{ participant.name }}</div>
          <div class="participant-points">{{ uiLabels.Points }}: {{ participant.score }}</div>
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
      participants: {
        type: Object,
        required: true
      },
      userScores: {
        type: Object,
        required: true
      }
      },
      created() {
        socket.on("uiLabels", labels => this.uiLabels = labels );
        socket.emit("getUILabels", this.lang );
    },
    computed: {
      sortedParticipants() {
        return Object.entries(this.participants)
          .map(([id, participant]) => ({
            id,
            name: participant.name,
            score: this.userScores[id] || 0
          }))
          .sort((a, b) => b.score - a.score);
      }
    }
  }
  </script>
  
  <style scoped>
  .leaderboard-container {
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 30px;
    height: 580px;
    overflow-y: auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .leaderboard-title {
    font-size: 1.5rem;
    margin-bottom: 20px;
    text-align: center;
    color: #333;
    position: relative;
  }
  
  .trophy {
    font-size: 1.5em;
    margin: 0 10px;
    animation: shine 1s infinite;
  }
  
  .participants-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .participant-card {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 12px;
    text-align: center;
    transition: transform 0.2s ease;
    position: relative;
  }
  
  .winner {
    background: linear-gradient(135deg, #ffd700 0%, #fff6a1 100%);
    border: 2px solid #ffd700;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }
  
  .second {
    background: linear-gradient(135deg, #c0c0c0 0%, #e0e0e0 100%);
    border: 2px solid #c0c0c0;
    transform: scale(1.03);
    box-shadow: 0 4px 12px rgba(192, 192, 192, 0.3);
  }
  
  .third {
    background: linear-gradient(135deg, #cd7f32 0%, #e0a96d 100%);
    border: 2px solid #cd7f32;
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(205, 127, 50, 0.3);
  }
  
  .position {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: bold;
    color: #666;
  }
  
  .medal {
    position: absolute;
    top: -15px;
    right: 10px;
    font-size: 1.5em;
    animation: bounce 1s infinite;
  }
  
  .participant-name {
    margin: 5px 0;
    font-weight: bold;
    font-size: 1.1em;
  }
  
  .participant-points {
    font-size: 1em;
    color: #444;
    font-weight: 500;
  }
  
  .winner .participant-name {
    color: #000;
    font-size: 1.2em;
  }
  
  .winner .participant-points {
    color: #000;
    font-weight: bold;
  }

  </style>