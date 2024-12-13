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
            <input type="text" v-model="gameCode" class="text-square">
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
      gameCode: "inactive game",
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
    }
  },
  created() {
    this.gameCode = this.$route.params.id;
    socket.emit("joinGame", this.gameCode);
    socket.on("uiLabels", labels => this.uiLabels = labels );
    socket.emit("getUILabels", this.lang );
  },
  methods: {
    participateInGame() {
      if (this.gameCode && this.userName) {
        socket.emit("participateInGame", { gameCode: this.gameCode, name: this.userName });
        this.$router.push(`/lobby/${this.gameCode}`);
        localStorage.setItem('gameId', this.gameCode);
        localStorage.setItem('isAdmin', 'false');
        localStorage.setItem('playerName', this.userName);
      } 
      else {
        alert("Please enter both game code and your name.");
      }
    }
  }
}
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