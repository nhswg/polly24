<template>
  <div class="sketchdle-container">
    <header>
      <router-link to="/about/">
        <button class="about-button">?</button>
      </router-link>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container" v-on:click="switchLanguage">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>
    <div class="header-line"></div>

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
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem( "lang") || "en",
      hideNav: true
    }
  },
  created() {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
  methods: {
    switchLanguage() {
      this.lang = this.lang === "en" ? "sv" : "en";
      localStorage.setItem("lang", this.lang);
      socket.emit("getUILabels", this.lang);
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Schoolbell&display=swap');
* {
    font-family: Schoolbell, cursive;
    color: #102539;
}

.sketchdle-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #87c5eb 0%, #E0F6FF 100%);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  height: 100px; /* Reduced height */
}
.header-line {
  height: 3px;
  background-color: #0b3866;
  width: 90%;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.title {
  font-family: 'Schoolbell', cursive;
  font-size: 4rem;
  margin: 0;
}

.about-button {
    font-size: 2rem;
    border-radius: 0.1em;
    width: 50px;
    height: 50px;
    padding: 0;
    transition: all 0.3s ease;
}

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

.game-buttons {
    display: flex;
    justify-content: center;
    gap: 3rem;
    margin-top: 10rem;
    color: #0b3866
}

.game-button {
    font-size: 3.5rem;
    width: 350px;
    height: 200px;
    border: 5px solid #0b3866;
    color: #0b3866;
    transition: all 0.3s ease;
    border-radius: 1rem;
}

button {
    background-color: white;
}

button:hover {
    background-color: rgb(26, 105, 166);
    color: white;
    transform: translateY(-5px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
}
</style>