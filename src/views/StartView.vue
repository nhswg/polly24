<template>
  <div>
    <header>
      <router-link to="/about/">
        <button class="about-button">?</button>
      </router-link>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container" v-on:click="switchLanguage">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>

    <ResponsiveNav v-bind:hideNav="hideNav">
    <section class="game-buttons">
      <router-link to="/join/">
        <button class="game-button">{{uiLabels.joinGame}}</button>
      </router-link>

      <router-link to="/create/">
        <button class="game-button">{{uiLabels.createGame}}</button>
      </router-link>
    </section>
    </ResponsiveNav>
  </div>
</template>

<script>
import ResponsiveNav from '@/components/ResponsiveNav.vue';
import io from 'socket.io-client';
const socket = io("localhost:3000");

export default {
  name: 'StartView',
  components: {
    ResponsiveNav
  },
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    switchLanguage: function() {
      if (this.lang === "en") {
        this.lang = "sv"
      }
      else {
        this.lang = "en"
      }
      localStorage.setItem( "lang", this.lang );
      socket.emit( "getUILabels", this.lang );
    },
    toggleNav: function () {
      this.hideNav = ! this.hideNav;
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');
* {
    background-color: rgb(158, 221, 245);
    font-family: pacifico, cursive;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 2rem;
    padding-right: 2rem;
}

.title {
    font-size: 5rem;
}

.about-button {
    font-size: 1.5rem;
    border: 0.2em solid black;
    width: 50px;
    height: 50px;
    padding: 0;
}

.flag-container {
    border: 0.1em solid black;
    padding: 0;
}

.flag-container img {
    display: block;
    width: 80px;
    height: auto;
}

.game-buttons {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-top: 4rem;
}

.game-button {
    font-size: 3.5rem;
    width: 400px;
    height: 200px;
    border: 0.5rem solid black;
    border-radius: 1rem;
}

button {
    background-color: white;
}

button:hover {
    background-color: rgb(26, 105, 166);
    color: white;
    cursor: pointer;
}
</style>