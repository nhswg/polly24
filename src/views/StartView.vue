<template>
  <div class="sketchdle-container">
    <header>
      <router-link to="/about/">
        <button class="title-button">
          ?
        </button>
      </router-link>

      <h1 class="title">Sketchdle</h1>

      <button class="flag-container" v-on:click="switchLanguage">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>
    <div class="header-line"></div>

    <main>
      <ResponsiveNav v-bind:hideNav="hideNav">
        <div class="game-buttons">
          <router-link to="/join/">
            <button class="game-button">
              {{ uiLabels.joinGame }}
            </button>
          </router-link>

          <router-link to="/create/">
            <button class="game-button">
              {{ uiLabels.createGame }}
            </button>
          </router-link>
        </div>
      </ResponsiveNav>
    </main>
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
      lang: localStorage.getItem("lang") || "en",
      hideNav: true
    }
  },
  created() {
    socket.on("uiLabels", labels => this.uiLabels = labels);
    socket.emit("getUILabels", this.lang);
  },
  methods: {
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
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Schoolbell&display=swap');

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
    border-radius: 1rem;
}
</style>