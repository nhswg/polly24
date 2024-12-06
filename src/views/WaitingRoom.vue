<template>
    <div class="waiting-lobby">
      <p>
        Waiting for host to start game
        <span class="dots">
          <span class="dot">.</span>
          <span class="dot">.</span>
          <span class="dot">.</span>
        </span>
      </p>
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
  }
  
  .dot {
    display: inline-block;
    font-size: 2rem;
    animation: bounce 1.5s infinite;
  }
  
  .dot:nth-child(1) {
    animation-delay: 0s;
  }
  
  .dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  
  .dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  
  /* Keyframes för "hoppa upp och ner"-effekt */
  @keyframes bounce {
    0%, 100% {
      transform: translateY(0); /* Ursprungsläge */
    }
    50% {
      transform: translateY(-5px); /* Hoppa upp */
    }
  }
  </style>
  