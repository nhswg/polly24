<template>
  <div>
    <!-- Om nuvarande runda ej har passerat det valda antalet rundor -->
    <div v-if="currentRound <= gameData.rounds">
      <GameInfoComponent 
        :wordOptions="isDrawing ? wordOptions : []" 
        :currentWord="displayedWord" 
        :timer="timer"
        :currentRound="currentRound"
        @select-word="selectWord"
        @leave-game="handleLeaveGame"
      />


      <div class="game-area">
        <LeaderboardComponent :participants="participants" :userScores="userScores" />
        <DrawingComponent ref="drawingComp":currentWord="currentWord" :canDraw="isDrawing" />
        <ChatComponent  
          :messages="messages" 
          :chatMessage="chatMessage"
          :canDraw="isDrawing"
          @sendChatMessage="sendChatMessage" 
          @updateChatMessage="chatMessage = $event" 
        />
      </div>
    </div>

    <!-- Om currentRound överskrider chosenRounds visas endast en stor leaderboard -->
    <div v-else class="final-leaderboard-container">
      <h2>Spelet är slut!</h2>
      <LeaderboardComponent 
        :participants="participants" 
        :userScores="userScores"
        class="final-leaderboard" 
        />
      <button @click="handleLeaveGame">Till huvudsidan</button>
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
      currentDrawerIndex: 0,
      userScores: {},
      correctGuessers: [],
    };
  },

  computed: {
  displayedWord() {
      if (this.isDrawing) {
        return this.currentWord; // Tecknaren ser ordet
      } else {
        return this.generateUnderscores(this.currentWord); // Gissarna ser understreck
      }
    }
  },


  created() {
    this.gameCode = this.$route.params.id;
    this.userID = this.$route.params.userID;
    socket.emit("joinGame", this.gameCode);
    socket.emit("getGameData", { gameCode: this.gameCode });

    socket.on('gameData', (data) => {
    this.gameData = data;
    this.timer = data.drawTime;

    // Om gameData kom först eller sist spelar ingen roll,
    // kolla igen ifall du kan generera ord nu.
    if (this.isDrawing && !this.currentWord && this.gameData.theme && this.gameData.language) {
      this.generateWordOptions();
    }
  });

  socket.on("participantsUpdate", (participants) => {
  this.participants = participants;
  for(const userID in participants)
   { 
    const participant = participants[userID];
    if (!(participant.name in this.userScores)) {
      this.userScores[participant.name] = 0;
    }
    }

  
  const participantIDs = Object.keys(this.participants);

  if (participantIDs.length >= 2) {
    if (this.currentDrawerIndex >= participantIDs.length) {
          this.currentDrawerIndex = 0;
        }
        const currentDrawerID = participantIDs[this.currentDrawerIndex];
        this.isDrawing = (currentDrawerID === this.userID);

        // Försök generera ordalternativ om möjligt
        if (this.isDrawing && !this.currentWord && this.gameData.theme && this.gameData.language) {
          this.generateWordOptions();
        } else {
          this.wordOptions = [];
        }
      } else {
        this.isDrawing = false;
        this.wordOptions = [];
      }
    });

    socket.on('timerStarted', (time) => {
      this.timer = time;
      this.startTimer();
    });
  
    socket.on("chatMessage", (msg) => {
      this.messages.push(msg);
    });

    socket.on('wordSelected', (data) => {
    this.currentWord = data.word;
    });
    socket.on('correctGuessAnnouncement', (data) => {
      this.messages.push({
      username: data.username,
      text: 'guessed correctly!',
    });
  });
  socket.on("scoresUpdated", (updatedScores) => {
  this.userScores = updatedScores;
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

        socket.emit('wordSelected', {
        gameCode: this.gameCode,
        word: this.currentWord
      });

        socket.emit('startTimer', {
        gameCode: this.gameCode,
        time: this.gameData.drawTime
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
          this.$refs.drawingComp.resetCanvas();
        }
      }, 1000);
    },

    rotateDrawingRole() {
  const participantIDs = Object.keys(this.participants);
  if (participantIDs.length > 0) {
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
    this.correctGuessers = [];

    // Generera ordalternativ bara om du är tecknaren
    if (this.isDrawing) {
      this.generateWordOptions();
    }

  } else {
    this.isDrawing = false;
    this.wordOptions = [];
  }
},

      
   sendChatMessage() {
    if (!this.chatMessage.trim()) return;

    const username = this.participants[this.userID]?.name || "Unknown";

    if (this.isDrawing) {
      // Om tecknaren försöker skicka ett meddelande, rensa chatten och gör ingenting
      this.chatMessage = '';
      return;
    }

    if (this.correctGuessers.includes(username)) {
    this.chatMessage = '';
    return;
    }

    if (this.chatMessage.trim().toLowerCase() === this.currentWord.toLowerCase()) {
      socket.emit("correctGuess", {
        gameCode: this.gameCode,
        username: username,
        word: this.currentWord,
      });

      this.userScores[username]++;
      this.correctGuessers.push(username);

      socket.emit("updateScores", {
      gameCode: this.gameCode,
      userScores: this.userScores,
    });
    } 

    else {
      socket.emit("chatMessage", {
        gameCode: this.gameCode,
        username: username,
        text: this.chatMessage,
      });

    }

    this.chatMessage = '';
},

      generateUnderscores(word) {
    if (!word) return '';
    // Dela meningen på ord
    return word
      .split(' ')
      .map(w => w.replace(/./g, '_').split('').join(' ')) // ersätt varje tecken med '_'
      .join('   '); // separera ord med extra mellanslag
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