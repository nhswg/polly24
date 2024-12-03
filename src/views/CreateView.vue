<template>

<h1 id = "header">Create Game</h1>

  <div class="blocks-container">
    <!-- Language -->
    <div class="block">
      <h3>Language</h3>
      <select v-model="selectedLanguage">
        <option v-for="language in languages" :key="language.value" :value="language.value">
          {{ language.label }}
        </option>
      </select>
    </div>

    <!-- Drawtime -->
    <div class="block">
      <h3>Drawtime</h3>
      <select v-model="selectedDrawtime">
        <option v-for="time in drawTimes" :key="time" :value="time">
          {{ time }} seconds
        </option>
      </select>
    </div>

    <!-- Rounds -->
    <div class="block">
      <h3>Rounds</h3>
      <select v-model="selectedRounds">
        <option v-for="round in rounds" :key="round" :value="round">
          {{ round }}
        </option>
      </select>
    </div>
  

      <!-- Theme -->
      <div class="block">
      <h3>Theme</h3>
      <select v-model="selectedThemes">
        <option v-for="theme in themes" :key="theme" :value="theme">
          {{ theme }} 
        </option>
      </select>
    </div>
</div>

<div class = "create-game-button">
    <button v-on:click="createGame">
        Create Game        
    </button>
</div>

    

</template>

<script>
export default {
  data() {
    return {
      languages: [
        { value: 'english', label: 'English' },
        { value: 'swedish', label: 'Svenska' },
      ],
      drawTimes: [30, 60, 90, 120, 150, 180],
      rounds: Array.from({ length: 10 }, (_, i) => i + 1),
      themes: ['Standard', 'Office', 'Animals', 'Food', 'Movies', 'Music', 'Nature', 'Sports', 'Technology'],
      selectedLanguage: 'english',
      selectedDrawtime: 30,
      selectedRounds: 1,
      selectedThemes: 'Standard'
    };
  },
};
</script>


<style>

#header {
  color: black;
  font-size: 75px;
  text-align: center;
  margin-bottom: 150px;

}

.blocks-container {
  display: flex;
  flex-direction: row;
  align-items: center; 
  justify-content: center; 
  gap: 20px; 
  margin-bottom: 100px;
}

.block {
  border: 1px solid #ccc;
  border-radius: 10px; 
  padding: 15px;
  text-align: center;
  width: 150px;
  background-color: #f9f9f9;
}

.create-game-button button {
  padding: 20px 40px; 
  font-size: 2rem; 
  background-color: #007bff; 
  color: white; 
  border: none;
  border-radius: 10px;
  cursor: pointer; 
}
.create-game-button button:hover {
  background-color: cyan; 
  color: black;
}
.create-game-button {
  text-align: center; 
  margin-top: 20px; 
}


select {
  margin-top: 10px;
  padding: 5px;
  width: 100%; 
}

</style>