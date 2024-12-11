<template>
  <div class="information-banner">
    <button 
        class="leave" v-on:click="confirmLeave">
        Leave game
    </button>
    <div class="current-word">
      shurdass
    </div>
    <div class="timer-container">
      <img src="/img/clock.jpg" alt="Clock" class="clock-image">
      <div class="timer-text">{{ timer }}</div>
    </div>
    <div class="round-container">
      <img src="/img/round.jpg" alt="Clock" class="round-image">
      <div class="round-text">1</div>
    </div>
  </div>
  <div class="game-area">
    <div class="leaderboard">
      <p>Leaderboard</p><br>
      <div class="participant-name" v-for="participant in participants" :key="participant">
      {{ participant.name}}
      </div>
    </div>
    <div class="drawing-area"
    v-on:mousedown="startDrawing"
    v-on:mousemove="draw"
    v-on:mouseup="stopDrawing"
    v-on:mouseleave="stopDrawing"
    >
      <canvas ref="canvas" width="800" height="500"></canvas>
      <div class="current-color" v-bind:style="{ backgroundColor: penColor }"></div>
    

        <button class="button-container" v-on:click="changeStrokeColor('#ffffff')"><img src="/img/ffffff.png" alt="White" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#000000')"><img src="/img/Black.png" alt="Black" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#3f48cc')"><img src="/img/3f48cc.png" alt="Blue" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#0dae3b')"><img src="/img/0dae3b.png" alt= "Green"></button>
        <button class="button-container" v-on:click="changeStrokeColor('#8cfffb')"><img src="/img/8cfffb.png" alt="Lightblue" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#724a33')"><img src="/img/724a33.png" alt="Brown" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#88238a')"><img src="/img/88238a.png" alt="Purple" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#888888')"><img src="/img/888888.png" alt="Grey" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#ff3d7b')"><img src="/img/ff3d7b.png" alt="Pink" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#ff7f27')"><img src="/img/ff7f27.png" alt= "Orange"></button>
        <button class="button-container" v-on:click="changeStrokeColor('#fff200')"><img src="/img/fff200.png" alt="Yellow" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#EC1C24')"><img src="/img/ec1c24.png" alt="Red" /> </button>

        <button class="button-container" v-on:click="changeLineWidth('2')"><img src="/img/1.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('7')"><img src="/img/2.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('15')"><img src="/img/3.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('20')"><img src="/img/4.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('50')"><img src="/img/5.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('100')"><img src="/img/6.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#FFFFFF')"><img src="/img/sudd.png" alt="Eraser" /></button>
        <button class="button-container" v-on:click="undoLastStroke()"><img src="/img/undo.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="resetCanvas()"><img src="/img/reset.png" alt="White" /></button>
    </div>
    <div class="chat">
        Chat
    </div>
  </div>
  <ul class="settings-list" v-if="gameData && gameData.language">
<li><strong>Language:</strong> {{ gameData.language }}</li>
<li><strong>Drawtime:</strong> {{ gameData.drawTime }} seconds</li>
<li><strong>Rounds:</strong> {{ gameData.rounds }}</li>
<li><strong>Theme:</strong> {{ gameData.theme }}</li>
</ul>
</template>

<script>

import io from 'socket.io-client';
import wordsEn from '@/assets/words-en.json';
import wordsSv from '@/assets/words-sv.json';
const socket = io("http://localhost:3000");

export default {
  data() {
    return {
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      penColor: '#000000',
      lineWidth: 7,
      participants: [],
      gameData: {},
      strokes: [], 
      currentStroke: [],
      timer: 0,
      timerInterval: null,
      currentWord: ''
    };
  },

  created() {
  this.gameCode = localStorage.getItem('gameId'); 
  socket.emit("joinGame", this.gameCode);

  socket.on("participantsUpdate", (participants) => {
    this.participants = participants;
  });

  socket.on('gameData', (data) => {
    this.gameData = data;
    this.timer = data.drawTime;
    this.startTimer();
    this.currentWord = this.getRandomWord(); 
    });
    socket.emit("getGameData", { gameId: localStorage.getItem("gameId") });
},

  methods: {
    startDrawing(event) {
      this.isDrawing = true;
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.currentStroke = []; 
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

  this.currentStroke.push({
    x1: this.lastX,
    y1: this.lastY,
    x2: event.offsetX,
    y2: event.offsetY,
    color: this.penColor,
    width: this.lineWidth
  });

  this.lastX = event.offsetX;
  this.lastY = event.offsetY;
},
  getRandomWord() {
      let words;
      if (this.gameData.language === "English") {
        words = wordsEn[this.gameData.theme];
      } else if (this.gameData.language === "Swedish") {
        words = wordsSv[this.gameData.theme];
      }
      if (words && words.length > 0) {
        const randomIndex = Math.floor(Math.random() * words.length);
        return words[randomIndex];
      } else {
        return null;
      }
    },
  
    stopDrawing() {
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]); 
        this.currentStroke = []; 
      }
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
    this.$router.push('/'); 
    }
  },
  undoLastStroke() {
      if (this.strokes.length === 0) return;

      this.strokes.pop(); 

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.strokes.forEach(stroke => {
        stroke.forEach(segment => {
          ctx.strokeStyle = segment.color;
          ctx.lineWidth = segment.width;
          ctx.beginPath();
          ctx.moveTo(segment.x1, segment.y1);
          ctx.lineTo(segment.x2, segment.y2);
          ctx.stroke();
        });
      });
    },

    resetCanvas() {
    const canvas = this.$refs.canvas;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);

      this.timerInterval = setInterval(() => {
        if (this.timer > 0) {
          this.timer--;
        } else {
          clearInterval(this.timerInterval);
          this.timerInterval = null;
        }
      }, 1000);
    }
  }
}
</script>

<style scoped>
.information-banner{
  display: grid;
  grid-template-columns: 1fr 6fr 1fr 1fr;
  height: 80px;
}

.current-word {
  flex: 1;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
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
.button-container {
  border: 0.1em solid black;
  padding: 0;
}
.button-container img {
  display: block;
    width: 30px;
    height: auto;
    background-color: white;
}

.timer-container {
  position: relative;
  width: 100px;
  height: 100px; 
}

.clock-image {
  width: 80%;
  height: auto;
}

.timer-text {
  position: absolute;
  top: 43%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 20px;    
  color: black;   
  font-weight: bold;
}

.round-container {
  position: relative;
  width: 100px;  
}

.round-image {
  width: 80%;
  height: auto;
}

.round-text {
  position: absolute;
  top: 47%;
  left: 47%;
  transform: translate(-50%, -50%);
  font-size: 20px;    
  font-weight: bold;
}
</style>
