<template>

    <div class="join-game" v-if="!joined">
      <div>
        Enter game code:
        <input type="text" v-model="gameCode">
      </div>

      <div>
        Enter your name:
        <input type="text" v-model="userName">
      </div>

      <div>
        <button v-on:click="participateInGame">
          Join Game
        </button>
      </div>
    </div>


    <div class="waiting-lobby" v-if="joined">
        <p>Waiting for host to start game</p>
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
      joined: false,
      gameCode: "inactive game",
    }
  },
  created: function () {
    this.gameCode = this.$route.params.id;
    socket.emit( "joinGame", this.gameCode );

  },
  methods: {
    participateInGame: function () {
      socket.emit( "participateInGame", {gameCode: this.gameCode, name: this.userName} )
      this.joined = true;
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
    height: 100vh;
  }
</style>