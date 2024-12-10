<template>
  <div>
    <header class="header">
      <h1 class="title center-text">Sketchdle</h1>
    </header>
  </div>

  <router-link to="/">
    <button class="header-button">
      {{ uiLabels.backButton }}
    </button>
  </router-link>


  <div class="join-game">
    <div class="join-game-form">
      <div>
      {{uiLabels.enterCode}}:
      <input type="text" v-model="gameCode" class="text-square">

      </div>
      <div>
      {{uiLabels.enterName}}:
      <input type="text" v-model="userName" class="text-square">
      </div>
    </div>

      <button v-on:click="participateInGame" class="join-game-button">
        {{uiLabels.joinGame}}
      </button>

  </div>

</template>

<script>
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
name: 'LobbyView',
data: function () {
  return {
    userName: "",
    gameCode: "inactive game",
    uiLabels: {},
    lang: localStorage.getItem("lang") || "en",
  }
},
created: function () {
  this.gameCode = this.$route.params.id;
  socket.emit("joinGame", this.gameCode);
  socket.on("uiLabels", labels => this.uiLabels = labels );
  socket.emit("getUILabels", this.lang );

},
methods: {
  participateInGame: function () {
    if (this.gameCode && this.userName) {
      socket.emit("participateInGame", { gameCode: this.gameCode, name: this.userName });
      this.$router.push(`/lobby/${this.gameCode}`);
      localStorage.setItem('gameId', this.gameCode);
      localStorage.setItem('isAdmin', 'false');
      localStorage.setItem('playerName', this.userName);
    } else {
      alert("Please enter both game code and your name.");
    }
  }
}

}
</script>

<style>

.header {
  width: 100%;
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.center-text {
  text-align: center;
}

.title {
  font-size: 5rem;
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