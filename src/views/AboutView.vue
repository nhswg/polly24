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
      <div class="content">
        <h1 class="title">{{ uiLabels.gameRules }}</h1>

        <p class="text">
          {{ uiLabels.aboutPart1 }}
        </p>
  
        <p class="text">
          {{ uiLabels.aboutPart2 }}
        </p>
  
        <p class="text">
          {{ uiLabels.aboutPart3 }}
        </p>
  
        <p class="text">
          {{ uiLabels.aboutPart4 }}
        </p>
      </div>
    </main>
  </div>
</template>
  
<script>
import io from 'socket.io-client';
const socket = io(sessionStorage.getItem("dataServer"));

export default {
  name: 'About',
  data() {
    return {
      uiLabels: {},
      lang: localStorage.getItem( "lang") || "en",
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
  
<style scoped>

.content {
  max-width: 800px;
  margin: 0 auto; 
  margin-top: 20px;
  margin-bottom: 20px;
  padding: 20px; 
  background-color: rgb(247, 247, 247);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 1rem;
}
.content h1 {
  font-size: 3rem;
  margin-top: 0px;
  margin-bottom: 20px;
  text-align: left;
}

.text {
  font-size: 20px;
  text-align: justify; 
  margin-bottom: 20px;
}
</style>
