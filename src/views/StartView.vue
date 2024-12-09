<template>
  <div>
    <header>
      <router-link to="/about/">
        <button class="about-button">?</button>
      </router-link>
      <h1 class="title">Sketchdle</h1>
      <button class="flag-container">
        <img src="/img/flag.png" alt="changeLanguagePic">
      </button>
    </header>

    <section class="game-buttons">
      <router-link to="/join/">
        <button class="game-button">Join Game</button>
      </router-link>

      <router-link to="/create/">
        <button class="game-button">Create Game</button>
      </router-link>
    </section>
  </div>
</template>

<script>

</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Schoolbell&display=swap');
body {
    background-color: rgb(158, 221, 245);
}

* {
    font-family: 'Schoolbell', cursive;
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