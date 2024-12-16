<template>
  <div>
    <GameInfoComponent 
      :wordOptions="wordOptions" 
      :currentWord="currentWord" 
      :timer="timer"
      :currentRound="currentRound"
      @select-word="selectWord"
      @leave-game="handleLeaveGame"
    />

    <div class="game-area">
      <LeaderboardComponent :participants="participants" />
      <DrawingComponent :currentWord="currentWord" />
      <ChatComponent 
        :messages="messages" 
        :chatMessage="chatMessage" 
        @sendChatMessage="sendChatMessage" 
        @updateChatMessage="chatMessage = $event" 
      />
    </div>

    <ul class="settings-list" v-if="gameData && gameData.language">
      <li><strong>Language:</strong> {{ gameData.language }}</li>
      <li><strong>Drawtime:</strong> {{ gameData.drawTime }} seconds</li>
      <li><strong>Rounds:</strong> {{ gameData.rounds }}</li>
      <li><strong>Theme:</strong> {{ gameData.theme }}</li>
    </ul>
  </div>
</template>

<script>
import io from 'socket.io-client';
import wordsEn from '@/assets/words-en.json';
import wordsSv from '@/assets/words-sv.json';
import DrawingComponent from '@/components/DrawingComponent.vue';
import LeaderboardComponent from '@/components/LeaderboardComponent.vue';
import ChatComponent from '@/components/ChatComponent.vue';
import GameInfoComponent from '@/components/GameInfoComponent.vue';

const socket = io("http://localhost:3000");

export default {
  components: {
    DrawingComponent,
    LeaderboardComponent,
    ChatComponent,
    GameInfoComponent
  },
  data() {
    return {
      participants: [],
      gameData: {},
      timer: 0,
      timerInterval: null,
      currentWord: '',
      wordOptions: [],
      chatMessage: '',
      messages: [],
      userID: '',
      gameCode: '',
      currentRound: 1 // Exempelvärde, uppdatera baserat på din logik
    };
  },

  created() {
    this.gameCode = this.$route.params.id;
    this.userID = this.$route.params.userID;
    socket.emit("joinGame", this.gameCode);

    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
    });

    socket.on('gameData', (data) => {
      this.gameData = data;
      this.timer = data.drawTime; 
      this.startTimer(); 
      this.generateWordOptions(); 
      // Här kan du också uppdatera currentRound om det finns i din gameData
      // this.currentRound = data.currentRound; 
    });
    socket.emit("getGameData", { gameId: localStorage.getItem("gameId") });
  
    socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
    });
  },

  methods: {
    generateWordOptions() {
      let words = [];
      if (this.gameData.language === "English") {
        words = wordsEn[this.gameData.theme];
      } else if (this.gameData.language === "Swedish") {
        words = wordsSv[this.gameData.theme];
      }

      if (words && words.length >= 3) {
        const shuffledWords = words.sort(() => 0.5 - Math.random());
        this.wordOptions = shuffledWords.slice(0, 3);
      } else {
        console.warn("Not enough words to generate options.");
        this.wordOptions = ["Option 1", "Option 2", "Option 3"];
      }
    },

    selectWord(word) {
      this.currentWord = word;
      this.wordOptions = [];
    },

    handleLeaveGame() {
      this.$router.push('/');
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
    },
      
    sendChatMessage() {
      const playerName = localStorage.getItem('playerName') || 'Anonymous';
      socket.emit("chatMessage", {
        gameCode: this.gameCode, 
        username: playerName,
        text: this.chatMessage
      });
      this.chatMessage = '';
    }
  }
}
</script>

<style scoped>
.game-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
}
</style>