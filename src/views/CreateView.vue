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
      <div class="display-gamecode">
        {{ uiLabels.gameCode }}
        <span class="code-highlight">{{ gameID }}</span>
      </div>

      <div class="game-rules-container">
        <h2>{{ uiLabels.gameRules }}:</h2>
          <div class="rule">
            <h3>{{ uiLabels.Language }}</h3>
            <select v-model="this.gameData.wordsLanguage" @change="chooseWordsLanguage">
              <option v-for="wordsLanguage in wordsLanguages" :key="wordsLanguage.value" :value="wordsLanguage.value">
                {{ wordsLanguage.label }}
              </option>
            </select>
          </div>

          <div class="rule">
            <h3>{{ uiLabels.Drawtime }}</h3>
            <select v-model="this.gameData.drawTime" @change="chooseDrawTime">
              <option v-for="drawTime in drawTimes" :key="drawTime" :value="drawTime">
                {{ drawTime }} {{ uiLabels.Seconds }}
              </option>
            </select>
          </div>

          <div class="rule">
            <h3>{{ uiLabels.Rounds }}</h3>
            <select v-model="this.gameData.gameRounds" @change="chooseRounds">
              <option v-for="gameRound in gameRoundsList" :key="gameRound" :value="gameRound">
                {{ gameRound }}
              </option>
            </select>
          </div>

    
          <div class="rule">
            <h3>{{ uiLabels.Theme }}</h3>
            <select v-model="this.gameData.theme" @change="chooseTheme">
              <option v-for="theme in themes" :key="theme" :value="theme">
                {{ theme }} {{ uiLabels.theme }}
              </option>
            </select>
          </div>
        </div>

      <div class="create-div">
        <div>
          <input type="text" class="adminName" v-model="this.gameData.adminName" :placeholder= "uiLabels.enterName" @keyup.enter="createGame">
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
const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'CreateView',
  
  data() {
  return {
    gameID: '',
    gameData: {},
    uiLabels: {},
    lang: localStorage.getItem("lang") || "en",
    wordsLanguages: [
      { value: 'English', label: 'EN' },
      { value: 'Swedish', label: 'SWE' }
    ],
    drawTimes: [5,10,30, 60, 90, 120, 150, 180],
    gameRoundsList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  };
},
  created() {
    this.gameID = '' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');

    socket.emit('createGame', { gameID: this.gameID, lang: this.lang });

    socket.emit('getGameData', { gameID: this.gameID });
    socket.on('getGameData', (gameData) => {
    console.log("Game data received:", gameData);
    this.gameData = gameData;
    });

    socket.on("uiLabels", labels => this.uiLabels = labels );
    socket.emit("getUILabels", this.lang );
  },
  computed: {
    themes() {
      return [
        this.uiLabels.Mixed,
        this.uiLabels.Office,
        this.uiLabels.Animals,
        this.uiLabels.Food,
        this.uiLabels.Movies,
        this.uiLabels.Music,
        this.uiLabels.Sports,
      ];
    } 
  },
  methods: {
    generateuserID() {
      this.userID = Math.random().toString(36).substr(2, 9);
    },

    chooseWordsLanguage() {
      console.log('Setting words language:', this.gameData.wordsLanguage, 'for gameID:', this.gameID);
      socket.emit('setWordsLanguage', {gameID: this.gameID, wordsLanguage: this.gameData.wordsLanguage
      });
    },

    chooseDrawTime() {
      console.log('Setting draw time:', this.gameData.drawTime, 'for gameID:', this.gameID);
      socket.emit('setDrawTime', {gameID: this.gameID, drawTime: this.gameData.drawTime
      });
    },

    chooseRounds() {
      console.log('Setting rounds to:', this.gameData.gameRounds, 'for gameID:', this.gameID);
      socket.emit('setGameRounds', {gameID: this.gameID, gameRounds: this.gameData.gameRounds})
    },

    chooseTheme() {
      console.log('Setting theme:', this.gameData.theme, 'for gameID:', this.gameID);
      socket.emit('setTheme', {gameID: this.gameID, theme: this.gameData.theme})
    },

    createGame() {
      this.generateuserID();
      if (!this.gameData.adminName) {
        alert(this.uiLabels.pleaseEnterName);
        return;
    }
      socket.emit('joinGame', this.gameID);
      socket.emit('participateInGame', { gameID: this.gameID, userID: this.userID, name: this.gameData.adminName });
      console.log(`Generated adminID: ${this.userID}`);
      socket.emit('setAdmin', { gameID: this.gameID, adminID: this.userID, adminName: this.gameData.adminName });

      this.$router.push({
        path: `/lobby/${this.gameID}/${this.userID}`,
      });
    },

    switchLanguage() {
      if (this.lang === 'en') {
        this.lang = 'sv'
      }
      else {
        this.lang = 'en'
      }
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    }
  },
};
</script>

<style scoped>

.display-gamecode {
  font-size: 2.5rem;
  margin-bottom: 30px;
  margin-top: 30px;
  color: #333;
}

.code-highlight {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 5px;
  color: #333;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rule h3 {
  flex: 1; 
  color: solid #0b3866;
  text-align: left; 
  font-size: 1.4rem;
  border-bottom: 2px solid #ddd;
}

.rule select{
  text-align: right;
  width: 35%;
  font-size: 1.2rem;  
  border: 1px solid #ccc;  
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


@media (max-width: 600px) {
  .game-rules-container {
<<<<<<< HEAD
    width: 80%;
=======
    width: 90%;
>>>>>>> 990181e8e2d81a29158d05c6133b51341ef2cf1f
    padding: 5px;
  }

  .game-rules-container h2 {
  font-size: 1.5rem;
  margin-top: 0px;
  margin-bottom: 20px;
  text-align: left;
}
  .display-gamecode {
<<<<<<< HEAD
    font-size: 1.8rem; 
=======
    font-size: 1.8rem;
>>>>>>> 990181e8e2d81a29158d05c6133b51341ef2cf1f
    margin: 15px 0;
  }

  .rule {
<<<<<<< HEAD
    flex-direction: row; 
    align-items: center;
    justify-content: space-between; 
=======
    flex-direction: column;
    align-items: flex-start;
>>>>>>> 990181e8e2d81a29158d05c6133b51341ef2cf1f
    margin-bottom: 15px;
    width: 100%;
  }

  .rule h3 {
    font-size: 1rem;
    margin-bottom: 0; 
    width: 60%; 
  }

  .rule select {
<<<<<<< HEAD
    width: 35%; 
=======
    width: 100%; 
>>>>>>> 990181e8e2d81a29158d05c6133b51341ef2cf1f
    font-size: 1rem;
  }

  .create-div {
    flex-direction: column;
    margin: 20px;
  }

  .adminName {
    font-size: 1.5rem;
    width: 100%;
    margin-bottom: 10px;
  }

  .create-game-button {
<<<<<<< HEAD
    width: 50%; 
=======
    width: 100%; 
>>>>>>> 990181e8e2d81a29158d05c6133b51341ef2cf1f
    height: 45px;
    font-size: 1.3rem;
  }
}

</style>