<template>
  <div class="sketchdle-container">
    <header>
      <router-link to="/">
        <button class="title-button">
          ←
        </button>
      </router-link>

      <h1 class="title">Sketchdle</h1>

      <button class="flag-container" v-on:click="switchLanguage">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>
    <div class="header-line"></div>

    <main>
      <div class="create-game">
        <h1>{{ uiLabels.createGame }}</h1>
      </div>

      <div class="game-code">
        <h2>{{ uiLabels.gameCode }}: {{ gameCode }}</h2>
      </div>

      <div class="game-rules-container">
        <h2>{{ uiLabels.gameRules }}:</h2>
          <!-- Language -->
          <div class="rule">
            <h3>{{ uiLabels.Language }}</h3>
            <select v-model="selectedLanguage">
              <option v-for="language in languages" :key="language.value" :value="language.value">
                {{ language.label }}
              </option>
            </select>
          </div>

          <!-- Drawtime -->
          <div class="rule">
            <h3>{{ uiLabels.Drawtime }}</h3>
            <select v-model="selectedDrawtime">
              <option v-for="time in drawTimes" :key="time" :value="time">
                {{ time }} {{uiLabels.Seconds}}
              </option>
            </select>
          </div>

           <!-- Rounds -->
          <div class="rule">
            <h3>{{ uiLabels.Rounds }}</h3>
            <select v-model="selectedRounds">
              <option v-for="round in rounds" :key="round" :value="round">
                {{ round }}
              </option>
            </select>
          </div>

             <!-- Theme -->
          <div class="rule">
            <h3>{{ uiLabels.Theme }}</h3>
            <select v-model="selectedThemes">
              <option v-for="theme in themes" :key="theme" :value="theme">
                {{ theme }}
              </option>
            </select>
          </div>
        </div>

      <div class="create-div">
        <div>
          <input type="text" class="adminName" v-model="adminName" :placeholder= "uiLabels.enterName">
        </div>

        <button v-on:click="createGame" class="create-game-button">
          {{ uiLabels.createGame }}
        </button>
      </div>
    </main>
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
      selectedLanguage: 'English',
      selectedDrawtime: 30,
      selectedRounds: 1,
      selectedThemes: 'Standard',
      adminName:"",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
    };
  },
  created() {
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
    if (!this.adminName) {
        alert(this.uiLabels.pleaseEnterName);
        return;
    }
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

<style scoped>

.flag-container {
    border: 0.1em solid black;
    border-radius: 0.2em;
    padding: 0;
    transition: transform 0.3s ease;
}

.flag-container img {
    display: block;
    width: 80px;
    height: auto;
}

.create-game {
  font-size: 2rem;
}

.game-code {
  text-align: center;
  font-size: 30px;
}

.game-rules-container {
  background-color: rgb(247, 247, 247);
  padding: 10px;
  border-radius: 1rem;
  margin-bottom: 50px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  width: 50%;
  margin: 0 auto;
}

.game-rules-container h2 {
  font-size: 3rem;
  margin-top: 0px;
  margin-bottom: 20px;
  text-align: left;
}

.rule {
  display: flex;  /* Use flexbox to align the label and select side by side */
  justify-content: space-between;  /* Space between label and select */
  align-items: center;  /* Vertically align items */
}

.rule h3 {
  flex: 1;  /* Make the label take available space on the left */
  color: solid #0b3866;
  text-align: left;  /* Align label to the left */
  font-size: 1.4rem;
  border-bottom: 2px solid #ddd; /* Line between each rule */
}

.rule select{
  text-align: right;
  width: 35%;
  font-size: 1.2rem;  /* Increase font size */
  border: 1px solid #ccc;  /* Border around the select input */
  border-radius: 5px;
}

.create-div {
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: center;
  gap: 5px;
  margin: 40px; 
}

.adminName {
  font-size: 2rem;
  text-align: center;
  background-color: white;
  border-radius: 5px;
}

.create-game-button{
    width: 150px;
    height: 50px;
    font-size: 1.5rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
  }

.create-game-button:hover {
  background-color: #218838;
}

</style>