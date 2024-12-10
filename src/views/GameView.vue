<template>
    <div class="information-banner">
      <button 
          class="leave" v-on:click="confirmLeave">
          Leave game
      </button>
      <div class="current-word">
        Guess the word
      </div>
      <div class="round">
        Round
      </div>
    </div>
    <div class="game-area">
      <div class="leaderboard">
        <p>Leaderboard</p><br>
        <p>List of participants here</p><br>
        <p>---</p><br>
        <p>---</p><br>
        <p>---</p><br>
      </div>
      <div class="drawing-area"
      v-on:mousedown="startDrawing"
      v-on:mousemove="draw"
      v-on:mouseup="stopDrawing"
      v-on:mouseleave="stopDrawing"
      >
        <canvas ref="canvas" width="800" height="500"></canvas>
        <div class="current-color" v-bind:style="{ backgroundColor: penColor }"></div>
        <div class="button-container">
          <button v-on:click="changeStrokeColor('#FF5433')">Red</button>
          <button v-on:click="changeStrokeColor('#000000')">Black</button>
          <button v-on:click="changeStrokeColor('#FFFFFF')">White</button>
          <button v-on:click="changeStrokeColor('#33FF57')">Green</button>
          <button v-on:click="changeStrokeColor('#3357FF')">Blue</button>
          <button v-on:click="changeStrokeColor('#FFFF33')">Yellow</button>
          <button v-on:click="changeStrokeColor('#FF33A1')">Pink</button>
          <button v-on:click="changeStrokeColor('#FFFFFF')">Eraser</button>
          <button v-on:click="changeLineWidth('2')">2</button>
          <button v-on:click="changeLineWidth('7')">7</button>
          <button v-on:click="changeLineWidth('15')">15</button>
          <button v-on:click="changeLineWidth('20')">20</button>
          <button v-on:click="changeLineWidth('50')">50</button>
          <button v-on:click="changeLineWidth('100')">100</button>
          <button v-on:click="resetCanvas()">Reset</button>
        </div>
      </div>
      <div class="chat">
          Chat
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        isDrawing: false,
        lastX: 0,
        lastY: 0,
        penColor: '#000000',
        lineWidth: 7
      };
    },
    methods: {
      startDrawing(event) {
        this.isDrawing = true;
        this.lastX = event.offsetX;
        this.lastY = event.offsetY;
      },
      
      draw(event) {
        if (!this.isDrawing) return;
  
        const ctx = this.$refs.canvas.getContext('2d');
        ctx.strokeStyle = this.penColor;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.lastX, this.lastY);
        ctx.lineTo(event.offsetX, event.offsetY);
        ctx.stroke();
        this.lastX = event.offsetX;
        this.lastY = event.offsetY;
      },
    
      stopDrawing() {
        this.isDrawing = false;
      },
  
      changeStrokeColor(color) {
        this.penColor = color;   
      },
  
      changeLineWidth(width) {
        this.lineWidth = width;
      },
      confirmLeave() {
    if (confirm("Är du säker på att du vill lämna spelet?")) {
      this.$router.push('/'); // Navigerar till startsidan
      }
    },
      resetCanvas() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  }
  </script>
  
  <style scoped>
  .information-banner{
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
    height: 80px;
  }
  
  .game-area {
    display: grid;
    grid-template-columns: 1fr 2fr 1fr;
  }
  
  .drawing-area {
    position: relative;
    width: 800px;
    height: 600px;
    border: 1px solid #000;
  }
  canvas {
    display: block;
    background-color: white;
  }
  .current-color {
    margin-top: 15px;
    width: 50px;
    height: 50px;
    border: 2px solid #000;
    border-radius: 5px;
  }
  
  .leaderboard {
    border: 1px solid #000;
  }
  
  .chat {
    border: 1px solid #000;
  }
  .leave{
    width: 150px;
    height: 50px;
    font-size: 1.5rem;
    background-color: #dc3545;
    color:black;
    border: solid 1px black;
    border-radius: 5px;
    margin-top: 15px;
    margin-left: 50px;
  }
  
  </style>