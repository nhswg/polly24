<template>

  <h1 id="header">Create Game</h1>

  <router-link to="/">
        <button class="header-button">
            Back
        </button>
    </router-link>

    <div class="game-code">

      <h2>Game Code: {{ gameCode }}</h2>
    </div>
  
  
  <div class="blocks-container">
    <!-- Language -->
    <div class="block">
      <h3>Language</h3>
      <select v-model="selectedLanguage">
        <option v-for="language in languages" :key="language.value" :value="language.value">
          {{ language.label }}
        </option>
      </select>
    </div>


  
    <!-- Drawtime -->
    <div class="block">
      <h3>Drawtime</h3>
      <select v-model="selectedDrawtime">
        <option v-for="time in drawTimes" :key="time" :value="time">
          {{ time }} seconds
        </option>
      </select>
    </div>
  
    <!-- Rounds -->
    <div class="block">
      <h3>Rounds</h3>
      <select v-model="selectedRounds">
        <option v-for="round in rounds" :key="round" :value="round">
          {{ round }}
        </option>
      </select>
    </div>
  
    <!-- Theme -->
    <div class="block">
      <h3>Theme</h3>
      <select v-model="selectedThemes">
        <option v-for="theme in themes" :key="theme" :value="theme">
          {{ theme }}
        </option>
      </select>
    </div>
  </div>

  <div>
    <input type="text" class="adminName" v-model="adminName" placeholder="Enter your name">
  </div>
  
  <div class="create-game-button">
    <router-link :to="'/lobby/' + gameCode">

      <button @click="createGame"  >
        Create Game
      </button>
    
    </router-link>
  </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("http://localhost:3000");

  
  export default {
    name: 'CreateView',
    data() {
      return {
        gameCode: '',
        languages: [
          { value: 'English', label: 'English' },
          { value: 'Swedish', label: 'Svenska' },
        ],
        drawTimes: [30, 60, 90, 120, 150, 180],
        rounds: Array.from({ length: 10 }, (_, i) => i + 1),
        themes: ['Standard', 'Office', 'Animals', 'Food', 'Movies', 'Music', 'Nature', 'Sports', 'Technology'],
        selectedLanguage: 'English',
        selectedDrawtime: 30,
        selectedRounds: 1,
        selectedThemes: 'Standard',
        adminName:""
      };
    },
    created() {
      this.gameCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
      socket.on("gameCreated", (data) => {
        console.log(data);
      });
      socket.on("participantsUpdated", (participants) => {
        this.updateParticipants(participants);
      });
    },
    methods: {
      createGame() {
        const gameData = {
          gameId: this.gameCode,
          language: this.selectedLanguage,
          drawTime: this.selectedDrawtime,
          rounds: this.selectedRounds,
          theme: this.selectedThemes,
          adminName: this.adminName,
          participants: [this.adminName],
        };
        
        socket.emit("createGame", gameData);
        localStorage.setItem('gameId', this.gameCode);
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('playerName', this.adminName);
      
        this.$router.push({
          path: `/lobby/${this.gameCode}`,
      });
      },
      updateParticipants(participants) {
        this.participants = participants;
      },
    },
  };
  </script>

<style>

#header {
  color: black;
  font-size: 75px;
  text-align: center;
  margin-bottom: 150px;

}

.blocks-container {
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: center; 
  gap: 20px; 
  margin-bottom: 50px;
}

.block {
  border: 1px solid #ccc;
  border: 0.4rem solid black;
  padding: 15px;
  text-align: center;
  width: 150px;
  background-color: #f9f9f9;
}

.create-game-button button {
  padding: 20px 40px; 
  font-size: 2rem; 
  background-color: white; 
  color: black; 
  border: 0.4rem solid black;
  cursor: pointer; 
}
.create-game-button button:hover {
    background-color: rgb(26, 105, 166);
    color: white;
    cursor: pointer;
}
.create-game-button {
  text-align: center; 
  margin-top: 50px; 
  margin-bottom: 50px;
}
.adminName {
  font-size: 40px;
  text-align: center
}

select {
  margin-top: 10px;
  padding: 5px;
  width: 100%; 
}

.header-button {
    font-size: 1.5rem;
    border: 0.2em solid black;
    width: 80px;
    height: 50px;
    position: absolute; 
    top: 90px; 
    left: 120px; 
}

</style>