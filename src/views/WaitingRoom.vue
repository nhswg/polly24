<template>
    <div class="waiting-lobby">
      <p>Waiting for host to start game<span class="dots"></span></p>
    </div>
  </template>
  
  <script>
  export default {
    name: "WaitingLobby",
  };
  </script>
  
  <style scoped>
  .waiting-lobby {
    margin-top: 50px;
    font-size: 2rem;
    text-align: center;
  }
  
  .dots {
    display: inline-block;
    margin-left: 5px;
  }
  
  .dots::after {
    content: " ";
    display: inline-block;
    animation: dots 1.5s infinite;
  }
  
  /* Keyframes för animering */
  @keyframes dots {
    0% {
      content: ".";
    }
    33% {
      content: "..";
    }
    66% {
      content: "...";
    }
    100% {
      content: ".";
    }
  }
  </style>
  