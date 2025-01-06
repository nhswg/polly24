<template>
  <div>
    <!-- Om nuvarande runda ej har passerat det valda antalet rundor -->
    <div v-if="currentRound <= gameData.gameRounds">
      <GameInfoComponent 
        :wordOptions="isDrawing ? wordOptions : []"
        :currentWord="displayedWord"
        :timer="timer"
        :currentRound="currentRound"
        @select-word="selectWord"
        @leave-game="handleLeaveGame"
      />

      <div class="game-area">
        <LeaderboardComponent :participants="gameData.participants" :userScores="userScores" />
        <DrawingComponent ref="drawingComp" :currentWord="currentWord" :canDraw="isDrawing" />
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
        v-if="gameData.participants"
        :participants="gameData.participants"
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

const themeMapping = {
  'animals': 'djur',
  'food': 'mat',
  'sports': 'sporter',
  'mixed' : 'blandat',
  'movies & characters' : 'filmer & karaktärer',
  'music' : 'musik',
  'office' : 'kontor',
};

const reverseThemeMapping = Object.entries(themeMapping).reduce((acc, [eng, swe]) => {
  acc[swe] = eng;
  return acc;
}, {});

export default {
  components: {
    DrawingComponent,
    LeaderboardComponent,
    ChatComponent,
    GameInfoComponent
  },
  data() {
    return {
      showWordOptions: true,
      gameData: {},
      timer: 0,
      timerInterval: null,
      currentWord: '',
      wordOptions: [],
      chatMessage: '',
      messages: [],
      userID: '',
      gameID: '',
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
        return this.currentWord;
      } else {
        return this.generateUnderscores(this.currentWord);
      }
    }
  },

  created() {
    this.gameID = this.$route.params.id;
    this.userID = this.$route.params.userID;

    // 1. Anslut till spelet
    socket.emit("joinGame", this.gameID);

    // 2. Begär speldata
    socket.emit('getGameData', { gameID: this.gameID });
    
    // 3. När servern skickar speldata
    socket.on('getGameData', (gameData) => {
      console.log("Game data received:", gameData);
      this.gameData = gameData;
      this.timer = gameData.drawTime;

      // Om servern skickar vem som är tecknare 
      if (gameData.currentDrawerIndex !== undefined) {
        this.currentDrawerIndex = gameData.currentDrawerIndex;
      }

      // Om servern har ett redan valt ord, sätt det
      if (gameData.currentWord) {
        this.currentWord = gameData.currentWord;
      }

      // Nu kallar vi en metod för att sätta vem som är tecknare
      this.determineIfDrawing();
    });

    // 4. När participants uppdateras
    socket.on("participantsUpdate", (participants) => {
      console.log("participantsUpdate", participants);
      this.gameData.participants = participants;
      // Se till att alla får en poäng-post
      for(const userID in participants) {
        const participant = participants[userID];
        if (!(participant.name in this.userScores)) {
          this.userScores[participant.name] = 0;
        }
      }
      // Bestäm vem som är tecknare efter uppdateringen
      this.determineIfDrawing();
    });

    // Timer från servern
    socket.on('timerStarted', (time) => {
      this.timer = time;
      this.startTimer();
    });

    socket.on("sendChatHistory", (chatHistory) => {
      this.messages = chatHistory;
    });

    // Word har valts av tecknaren
    socket.on('selectedWord', (word) => {
      if (word) {
        this.gameData.currentWord = word;
        this.currentWord = word;
        this.showWordOptions = false;
      }
    });

    // Någon gissade rätt
    socket.on('correctGuessAnnouncement', (data) => {
      this.messages.push({
        username: data.username,
        text: 'guessed correctly!',
      });
    });

    // Poäng har uppdaterats
    socket.on("scoresUpdated", (updatedScores) => {
      this.userScores = updatedScores;
    });
  },

  methods: {
    /**
     * Sätter isDrawing = true om jag är currentDrawer, 
     * och genererar ordalternativ om inget redan är valt.
     */
    determineIfDrawing() {
      const participantIDs = Object.keys(this.gameData.participants || {});
      if (!participantIDs.length) {
        // Inga deltagare = ingen tecknare
        this.isDrawing = false;
        return;
      }

      // Säkerställ att currentDrawerIndex är inom arrayens längd
      if (this.currentDrawerIndex >= participantIDs.length) {
        this.currentDrawerIndex = 0;
      }

      const currentDrawerID = participantIDs[this.currentDrawerIndex];
      this.isDrawing = (currentDrawerID === this.userID);

      // Om jag är tecknaren men ord ej valt -> generateWordOptions
      if (this.isDrawing) {
        console.log("Jag är tecknaren");
        // Endast om vi har en theme + wordsLanguage
        if (!this.gameData.currentWord && this.gameData.theme && this.gameData.wordsLanguage) {
          this.generateWordOptions();
        } else {
          // Finns redan ett ord
          if (this.gameData.currentWord) {
            this.currentWord = this.gameData.currentWord;
          }
        }
      } else {
        // Jag är inte tecknaren
        if (this.gameData.currentWord) {
          this.currentWord = this.gameData.currentWord;
        }
        this.wordOptions = [];
      }
    },

    generateWordOptions() {
      console.log('Starting generateWordOptions');
      let words = [];
      const theme = this.gameData.theme;
      
      if (!theme || typeof theme !== 'string') {
        console.warn('Invalid theme:', theme);
        this.wordOptions = ["Option 1", "Option 2", "Option 3"];
        return;
      }

      let themeKey = theme.toLowerCase();
      
      if (this.gameData.wordsLanguage === "Swedish" && themeMapping[themeKey]) {
        // UI på engelska, ord på svenska
        themeKey = themeMapping[themeKey];
        words = wordsSv[themeKey];
      } else if (this.gameData.wordsLanguage === "English" && reverseThemeMapping[themeKey]) {
        // UI på svenska, ord på engelska
        themeKey = reverseThemeMapping[themeKey];
        words = wordsEn[themeKey];
      } else if (this.gameData.wordsLanguage === "English") {
        // UI på engelska, ord på engelska
        words = wordsEn[themeKey];
      } else {
        // UI på svenska, ord på svenska
        words = wordsSv[themeKey];
      }

      if (!words || words.length < 3) {
        console.warn(`Not enough words for theme: ${themeKey} in ${this.gameData.wordsLanguage}`);
        this.wordOptions = ["Option 1", "Option 2", "Option 3"];
      } else {
        const shuffledWords = words.sort(() => 0.5 - Math.random());
        this.wordOptions = shuffledWords.slice(0, 3);
      }
    },

    selectWord(word) {
      this.currentWord = word;
      this.wordOptions = [];

      // Säg till servern att ordet valts
      socket.emit('wordSelected', {
        gameID: this.gameID,
        word: this.currentWord
      });

      // Starta ritar-timer
      socket.emit('startTimer', {
        gameID: this.gameID,
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
      const participantIDs = Object.keys(this.gameData.participants || {});
      if (!participantIDs.length) return;

      // Nästa index
      this.currentDrawerIndex = (this.currentDrawerIndex + 1) % participantIDs.length;
      const currentDrawerID = participantIDs[this.currentDrawerIndex];
      this.isDrawing = (currentDrawerID === this.userID);

      // Om vi har gått igenom alla deltagare, öka rundan
      if (this.currentDrawerIndex === 0) {
        this.currentRound++;
      }

      // Nollställ
      this.currentWord = '';
      this.gameData.currentWord = '';
      this.wordOptions = [];
      this.correctGuessers = [];

      // Generera ordalternativ bara om jag är tecknaren
      if (this.isDrawing) {
        this.generateWordOptions();
      }
    },
      
    sendChatMessage() {
      if (!this.chatMessage.trim()) return;

      const username = this.gameData.participants[this.userID]?.name || "Unknown";

      // Om tecknaren försöker chatta = ignorera
      if (this.isDrawing) {
        this.chatMessage = '';
        return;
      }

      // Om jag redan gissat rätt = ignorera
      if (this.correctGuessers.includes(username)) {
        this.chatMessage = '';
        return;
      }

      // Kolla om jag gissar ordet
      if (this.chatMessage.trim().toLowerCase() === this.currentWord.toLowerCase()) {
        socket.emit("correctGuess", {
          gameID: this.gameID,
          username: username,
          word: this.currentWord,
        });

        this.userScores[username]++;
        this.correctGuessers.push(username);

        socket.emit("updateScores", {
          gameID: this.gameID,
          userScores: this.userScores,
        });
      } else {
        // Annars skicka normal chat
        socket.emit("chatMessage", {
          gameID: this.gameID,
          username: username,
          text: this.chatMessage,
        });
      }

      this.chatMessage = '';
    },

    generateUnderscores(word) {
      if (!word) return '';
      // Bygger underscores
      return word
        .split(' ')
        .map(w => w.replace(/./g, '_').split('').join(' '))
        .join('   ');
    }
  }
};
</script>

<style scoped>
.game-area {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 10px;
}
.final-leaderboard-container {
  text-align: center;
}
.final-leaderboard {
  margin: 0 auto;
  max-width: 400px;
}
</style>