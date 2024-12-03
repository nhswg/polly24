<template>

    <router-link to="/">
        <button class="header-button">
            Back
        </button>
    </router-link>

    <div class="content">
      <h1 class="title">Game Rules</h1>
  
      <p class="text">
        Sketchdle is a drawing and guessing game where players take turns illustrating and guessing words based on a specific theme. The objective is to score the most points by either guessing the correct word quickly or by creating clear drawings that help others guess your word.
      </p>
  
      <p class="text">
        Before starting the game, one player creates a private room, shares the link with the group, and customizes the settings. Players can select the number of rounds, the time limit for each turn, and a theme for the game, such as "Animals," "Office Items," or any other category. Custom words can also be added to fit the chosen theme.
      </p>
  
      <p class="text">
        During the game, players take turns drawing words randomly selected from the theme-based word pool. When it’s your turn to draw, you must use only the provided drawing tools to illustrate the word. Writing letters, numbers, or symbols that directly reveal the answer is not allowed. Drawings must adhere to the selected theme and should be relevant to the word chosen.
      </p>
  
      <p class="text">
        Players guess the word by typing their answers in the chat box, with multiple guesses allowed. However, players may not reveal the word verbally or give hints outside of their drawing. The faster you guess correctly, the more points you earn. At the end of all rounds, the player with the highest score is declared the winner.
  
        Sketchdle combines creativity and quick thinking with the added challenge of themed gameplay, making it a fun and engaging experience for everyone!
      </p>
    </div>
  </template>
  
  <script>
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
    width: 80px;
    height: 50px;
    position: absolute; 
    top: 120px; 
    left: 120px; 
}
  </style>
  