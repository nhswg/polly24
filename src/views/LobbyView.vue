<template>
    <div>
    <header>
      <router-link to="/about/">
        <button class="about-button">?</button>
      </router-link>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>
    </div>

  <div class="join-game">
    <div class="join-game-form">
      <div>
      Enter game code:
      <input type="text" v-model="gameCode" class="text-square">

      </div>
      <div>
      Enter your name:
      <input type="text" v-model="userName" class="text-square">
      </div>
    </div>

      <button v-on:click="participateInGame" class="join-game-button">
        Join Game
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
  }
},
created: function () {
  this.gameCode = this.$route.params.id;
  socket.emit( "joinGame", this.gameCode );

},
methods: {
  participateInGame: function () {
    if (this.gameCode && this.userName) {
      socket.emit("participateInGame", { gameCode: this.gameCode, name: this.userName });
      this.$router.push(`/playerlobby/${this.gameCode}`);
    } else {
      alert("Please enter both game code and your name.");
    }
  }
}

}
</script>

<style>
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
</style>