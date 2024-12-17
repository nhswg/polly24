<template>
  <div>
    <GameInfoComponent 
      :wordOptions=" isDrawing ? wordOptions: []" 
      :currentWord="currentWord" 
      :timer="timer"
      :currentRound="currentRound"
      @select-word="selectWord"
      @leave-game="handleLeaveGame"
    />

    <div class="game-area">
      <LeaderboardComponent :participants="participants" />
      <DrawingComponent :currentWord="currentWord" :canDraw="isDrawing" />
      <ChatComponent 
        :messages="messages" 
        :chatMessage="chatMessage" 
        @sendChatMessage="sendChatMessage" 
        @updateChatMessage="chatMessage = $event" 
      />
    </div>
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
      currentRound: 1,
      isDrawing: false,
      currentDrawerIndex: 0
    };
  },

  created() {
    this.gameCode = this.$route.params.id;
    this.userID = this.$route.params.userID;
    socket.emit("joinGame", this.gameCode);
    socket.emit("getGameData", { gameCode: this.gameCode });

    socket.on("participantsUpdate", (participants) => {
      this.participants = participants;
      // participants är nu ett objekt: { userID: {name: "..."}, ... }

      const participantIDs = Object.keys(this.participants);
      if (participantIDs.length >= 2) {
        // Se till att currentDrawerIndex aldrig överskrider antalet deltagare
        if (this.currentDrawerIndex >= participantIDs.length) {
          this.currentDrawerIndex = 0;
        }
        const currentDrawerID = participantIDs[this.currentDrawerIndex];
        this.isDrawing = (currentDrawerID === this.userID);
      } else {
        // Mindre än 2 spelare -> ingen ritar
        this.isDrawing = false;
      }
    });
    socket.on('gameData', (data) => {
      this.gameData = data;
      this.timer = data.drawTime; 
      this.generateWordOptions(); 
      // Här kan du också uppdatera currentRound om det finns i din gameData
      // this.currentRound = data.currentRound; 
    });

    socket.on('timerStarted', (time) => {
      this.timer = time;
      this.startTimer();
    });
  
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

      // Skicka till servern att vi ska starta timern för alla
      socket.emit('startTimer', {
        gameCode: this.gameCode,
        time: this.gameData.drawTime
      });

      // Meddela servern att ett ord har valts (valfritt)
      socket.emit('wordSelected', {
        gameCode: this.gameCode,
        word: this.currentWord
      });
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
          this.rotateDrawingRole();
        }
      }, 1000);
    },

    rotateDrawingRole() {
      const participantIDs = Object.keys(this.participants);
      if (participantIDs.length > 0) {
        // Roterar till nästa tecknare
        this.currentDrawerIndex = (this.currentDrawerIndex + 1) % participantIDs.length;
        const currentDrawerID = participantIDs[this.currentDrawerIndex];
        this.isDrawing = (currentDrawerID === this.userID);

        // Om vi har gått igenom alla deltagare, öka currentRound
        if (this.currentDrawerIndex === 0) {
          this.currentRound++;
        }

        // Nollställ variabler
        this.currentWord = '';
        this.wordOptions = [];

        // Generera ordalternativ för nya tecknaren
        if (this.isDrawing) {
          this.generateWordOptions();
        } else {
          this.wordOptions = [];
        }

        // Timern startas nu endast när ett ord har valts
      } else {
        this.isDrawing = false;
      }
    },
      
   sendChatMessage() {
        if (!this.chatMessage.trim()) return; // Kontrollera att meddelandet inte är tomt

        const username = this.participants[this.userID]?.name || "Unknown";

        socket.emit("chatMessage", {
          gameCode: this.gameCode,
          username: username, // Använd användarnamnet från userID
          text: this.chatMessage,
        });
        this.chatMessage = ''; // Rensa meddelandefältet
      }
    }
  }
</script>

<style scoped>
.game-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
}
</style>