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

//Om du vill hosta spelet avkommentera rad 45 och kommentera rad 46, när du vill pröva kör npm run host istället. 
//VIKTIGT ändra IPADRESS till ipadress på lokala nätverket som datorn och mobil är på. SAMT ändra origin i index.js server  

//sessionStorage.setItem("dataServer", "172.20.10.2:3000");
sessionStorage.setItem("dataServer", "localhost:3000");

const socket = io(sessionStorage.getItem("dataServer"));

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

@media (max-width: 600px) {
  .game-buttons {
    flex-direction: column; 
    gap: 1rem;
  }

  .game-button {
    font-size: 3.5rem;
    padding: 0.5rem 1rem;
    margin-bottom: 30px;
    align-items: center;
  }
}
</style>