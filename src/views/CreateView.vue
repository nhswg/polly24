<template>

  <h1 id="header">{{ uiLabels.createGame }}</h1>

  <router-link to="/">
        <button class="header-button">
          {{ uiLabels.backButton }}
        </button>
    </router-link>

    <div class="game-code">
      <h2>{{ uiLabels.gameCode }}: {{ gameCode }}</h2>
    </div>

    <div class="game-rules">
      <h2>{{ uiLabels.gameRules }}:</h2>
    </div>
  
  
  <div class="blocks-container">
    <!-- Language -->
    <div class="block">
      <h3>{{ uiLabels.Language }}</h3>
      <select v-model="selectedLanguage">
        <option v-for="language in languages" :key="language.value" :value="language.value">
          {{ language.label }}
        </option>
      </select>
    </div>


  
    <!-- Drawtime -->
    <div class="block">
      <h3>{{ uiLabels.Drawtime }}</h3>
      <select v-model="selectedDrawtime">
        <option v-for="time in drawTimes" :key="time" :value="time">
          {{ time }} {{uiLabels.Seconds}}
        </option>
      </select>
    </div>
  
    <!-- Rounds -->
    <div class="block">
      <h3>{{ uiLabels.Rounds }}</h3>
      <select v-model="selectedRounds">
        <option v-for="round in rounds" :key="round" :value="round">
          {{ round }}
        </option>
      </select>
    </div>
  
    <!-- Theme -->
    <div class="block">
      <h3>{{ uiLabels.Theme }}</h3>
      <select v-model="selectedThemes">
        <option v-for="theme in themes" :key="theme" :value="theme">
          {{ theme }}
        </option>
      </select>
    </div>
  </div>

  <div>
    <input type="text" class="adminName" v-model="adminName" :placeholder= "uiLabels.enterName">
  </div>
  
  <div class="create-game-button">
    <router-link :to="'/lobby/' + gameCode">

      <button @click="createGame"  >
        {{ uiLabels.createGame }}
      </button>
    
    </router-link>
  </div>
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("http://localhost:3000");

  
  export default {
    name: 'CreateView',
    data: function () {
      return {
        gameCode: '',
        languages: [
          { value: 'English', label: 'English' },
          { value: 'Swedish', label: 'Svenska' },
        ],
        drawTimes: [30, 60, 90, 120, 150, 180],
        rounds: Array.from({ length: 10 }, (_, i) => i + 1),
        selectedLanguage: 'English',
        selectedDrawtime: 30,
        selectedRounds: 1,
        selectedThemes: 'Standard',
        adminName:"",
        uiLabels: {},
        lang: localStorage.getItem("lang") || "en",
      };
    },
    created: function () {
      this.gameCode = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
      socket.on("gameCreated", (data) => {
        console.log(data);
      });
      socket.on("participantsUpdate", (participants) => {
        this.updateParticipants(participants);
      });
      socket.on("uiLabels", labels => this.uiLabels = labels );
      socket.emit("getUILabels", this.lang );
    },
    computed: {
      themes() {
        return [
          this.uiLabels.Standard,
          this.uiLabels.Office,
          this.uiLabels.Animals,
          this.uiLabels.Food,
          this.uiLabels.Movies,
          this.uiLabels.Music,
          this.uiLabels.Nature,
          this.uiLabels.Sports,
          this.uiLabels.Technology
        ];
      }
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
        }; /* Send game data to server */
        
        socket.emit("createGame", gameData);
        socket.emit("participateInGame", { gameCode: this.gameCode, name: this.adminName });
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
  margin-bottom: 50px;

}
.game-code {
  text-align: center;
  font-size: 30px;
  background-color: white; 
}

.game-rules {
  text-align: center;
  font-size: 20px;
  background-color: white; 
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
  text-align: center;
  background-color: white; 
}

select {
  margin-top: 10px;
  padding: 5px;
  width: 100%; 
}

.header-button {
    font-size: 1.5rem;
    border: 0.2em solid black;
    width: auto;
    height: 50px;
    position: absolute; 
    top: 90px; 
    left: 120px; 
    display: inline-block;
}

</style>