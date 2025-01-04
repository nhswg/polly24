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
      <div class="join-game">
        <div class="join-game-form">
          <div>
            {{ uiLabels.enterCode }}:
            <input type="text" v-model="gameID" class="text-square">
          </div>
          
          <div>
            {{ uiLabels.enterName }}:
            <input type="text" v-model="userName" class="text-square">
          </div>
        </div>

        <button v-on:click="participateInGame" class="join-game-button">
          {{ uiLabels.joinGame }}
        </button>
      </div>
    </main>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'LobbyView',
  
  data() {
    return {
      userName: "",
      gameID: "inactive game",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
      userID: "",
    }
  },
  created() {
    this.gameID = this.$route.params.id;
    socket.emit("joinGame", this.gameID);
    socket.on("uiLabels", labels => this.uiLabels = labels );
    socket.emit("getUILabels", this.lang );
  },
  methods: {
    generateUserID() {
      return Math.random().toString(36).substr(2, 9);
    },

    participateInGame() {
      this.userID = this.generateUserID();
      if (this.gameID && this.userName) {
        socket.emit("participateInGame", { gameID: this.gameID, userID: this.userID, name: this.userName });
        this.$router.push(`/lobby/${this.gameID}/${this.userID}`);
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('playerName', this.userName);
      } 
      else {
        alert("Please enter both game code and your name.");
      }
    },
    switchLanguage() {
      this.lang = this.lang === "en" ? "sv" : "en";
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    }
  }
}
</script>

<style scoped>

.join-game {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 40vh;
}

.join-game-form {
  font-size: 2rem;
  display: flex;
  flex-direction: column;
}
.join-game-form > div {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 400px;
  margin-bottom: 10px;
}
.join-game-form > div {
  justify-content: space-between;
}
.text-square {
  width: 200px;
  height: 30px;
  font-size: 1.5rem;
  margin: 10px;
  background-color: white;
  border: 0.1em solid rgb(142, 142, 142);
}

.join-game-button{
    width: 150px;
    height: 50px;
    font-size: 1.5rem;
    background-color: #28a745;
    color: white;
    border: none;
    border-radius: 5px;
    margin-top: 20px;
  }

.join-game-button:hover {
  background-color: #218838;
}
</style>