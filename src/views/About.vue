<template>

    <router-link to="/">
        <button class="header-button">
            {{uiLabels.backButton}}
        </button>
    </router-link>

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
  </template>
  
  <script>
  import io from 'socket.io-client';
  const socket = io("localhost:3000");

  export default {
  name: 'About',
  data: function () {
    return {
      uiLabels: {},
      lang: localStorage.getItem( "lang") || "en",
    }
  },
  created: function () {
    socket.on( "uiLabels", labels => this.uiLabels = labels );
    socket.emit( "getUILabels", this.lang );
  },
}

  </script>
  
  <style>
  .content {
    max-width: 800px; /* Sätt önskad maximal bredd */
    margin: 0 auto; /* Centrera innehållet horisontellt */
    padding: 20px; /* Valfri padding för att ge lite utrymme */
  }
  
  .title {
    text-align: center;
    margin-bottom: 20px;
  }
  
  .text {
    font-size: 20px;
    text-align: justify; /* Eller 'left' om du föredrar vänsterjusterad text */
    margin-bottom: 20px;
  }

  .header-button {
    font-size: 1.5rem;
    border: 0.2em solid black;
    width: auto;
    height: 50px;
    position: absolute; 
    display: inline-block;
    top: 120px; 
    left: 120px; 
}
  </style>
  