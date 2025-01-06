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
        <!-- 
            Leaderboard tar emot participants som ett objekt { userID: { name: ... } }
            och userScores som ett objekt { userID: number }.
        -->
        <LeaderboardComponent
          :participants="gameData.participants"
          :userScores="userScores"
        />
        <DrawingComponent
          ref="drawingComp"
          :currentWord="currentWord"
          :canDraw="isDrawing"
        />
        <ChatComponent
          :messages="messages"
          :chatMessage="chatMessage"
          :canDraw="isDrawing"
          :canGuess="!hasGuessedRight"
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
      hasGuessedRight: false,
      /* 
         userScores blir ett objekt:
         {
           userID1: 0,
           userID2: 5,
           ...
         }
      */
      userScores: {},
      correctGuessers: [],
    };
  },

  computed: {
    displayedWord() {
      return this.isDrawing
        ? this.currentWord
        : this.generateUnderscores(this.currentWord);
    }
  },

  created() {
    // Hämta gameID och userID från routen
    this.gameID = this.$route.params.id;
    this.userID = this.$route.params.userID;

    // 1. Anslut till spelet
    socket.emit("joinGame", this.gameID);

    // 2. Begär speldata
    socket.emit("getGameData", { gameID: this.gameID });

    // 3. När servern skickar speldata
    socket.on("getGameData", (gameData) => {
      console.log("Game data received:", gameData);
      this.gameData = gameData;
      this.timer = gameData.drawTime;

      // Om servern skickar vem som är tecknare
      if (gameData.currentDrawerIndex !== undefined) {
        this.currentDrawerIndex = gameData.currentDrawerIndex;
      }

      const myParticipant = gameData.participants[this.userID];
        if (myParticipant && myParticipant.guessedCorrectly) {
          this.hasGuessedRight = true;
        } else {
            this.hasGuessedRight = false;
          }

      // Om servern har ett redan valt ord, sätt det
      if (gameData.currentWord) {
        this.currentWord = gameData.currentWord;
      }

      // Bestäm vem som tecknar nu
      this.determineIfDrawing();
    });

    // 4. När participants uppdateras
    socket.on("participantsUpdate", (participants) => {
      console.log("participantsUpdate", participants);
      this.gameData.participants = participants;

      // Se till att alla får en poängpost: userScores[userID] = 0 om den inte finns
      for (const userID in participants) {
        if (!(userID in this.userScores)) {
          this.userScores[userID] = 0;
        }
      }

      // Bestäm vem som är tecknare
      this.determineIfDrawing();
    });

    // Timer från servern
    socket.on("timerStarted", (time) => {
      this.timer = time;
      this.startTimer();
    });

    // När servern skickar ny chathistorik
    socket.on("sendChatHistory", (chatHistory) => {
      this.messages = chatHistory;
    });

    // Ordet har valts av tecknaren
    socket.on("selectedWord", (word) => {
      if (word) {
        this.gameData.currentWord = word;
        this.currentWord = word;
        this.showWordOptions = false;
      }
    });

    // Någon gissade rätt
    socket.on("correctGuessAnnouncement", (data) => {
      this.messages.push({
        username: data.username,
        text: "guessed correctly!",
      });

      if (data.userID === this.userID) {
      this.hasGuessedRight = true;
      }
    });

    // Poäng har uppdaterats
    socket.on("scoresUpdated", (updatedScores) => {
      /*
        Här får du ett objekt med userID -> poäng,
        t.ex. { "djV51_xyz": 3, "abc123_yyy": 7 }
      */
      this.userScores = updatedScores;
    });

    socket.on('drawing', (data) => {
      this.$refs.drawingComp.drawFromSocket(data);
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
        // Inga deltagare => ingen tecknare
        this.isDrawing = false;
        return;
      }

      // Se till att currentDrawerIndex inte pekar utanför arrayen
      if (this.currentDrawerIndex >= participantIDs.length) {
        this.currentDrawerIndex = 0;
      }

      const currentDrawerID = participantIDs[this.currentDrawerIndex];
      this.isDrawing = (currentDrawerID === this.userID);

      // Om jag är tecknaren men ord ej valt => generera ordalternativ
      if (this.isDrawing) {
        console.log("Jag är tecknaren");
        if (!this.gameData.currentWord && this.gameData.theme && this.gameData.wordsLanguage) {
          this.generateWordOptions();
        } else if (this.gameData.currentWord) {
          // Finns redan ett ord
          this.currentWord = this.gameData.currentWord;
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
      console.log("Kör generateWordOptions()");
      let words = [];
      // Kolla språket
      if (this.gameData.wordsLanguage === "English") {
        words = wordsEn[this.gameData.theme];
      } else if (this.gameData.wordsLanguage === "Swedish") {
        words = wordsSv[this.gameData.theme];
      }

      if (!words || words.length < 3) {
        console.warn("Not enough words to generate options.");
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
      socket.emit("wordSelected", {
        gameID: this.gameID,
        word: this.currentWord
      });

      // Starta ritar-timer
      socket.emit("startTimer", {
        gameID: this.gameID,
        time: this.gameData.drawTime
      });
    },

    handleLeaveGame() {
      socket.disconnect();
      window.location.href = '/';
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

      this.currentDrawerIndex = (this.currentDrawerIndex + 1) % participantIDs.length;
      const currentDrawerID = participantIDs[this.currentDrawerIndex];
      this.isDrawing = (currentDrawerID === this.userID);

      // Om vi har gått igenom alla deltagare, öka rundan
      if (this.currentDrawerIndex === 0) {
        this.currentRound++;
      }

      // Nollställ
      this.currentWord = "";
      this.gameData.currentWord = "";
      this.wordOptions = [];
      this.correctGuessers = [];
      this.hasGuessedRight = false;

      socket.emit("resetGuesses", this.gameID); 
      socket.emit("clearChat", this.gameID);


      // Generera nya ordalternativ om jag nu är tecknaren
      if (this.isDrawing) {
        this.generateWordOptions();
      }
    },
      
    sendChatMessage() {
      if (!this.chatMessage.trim()) return;

      const username = this.gameData.participants[this.userID]?.name || "Unknown";

      // Om tecknaren försöker chatta => ignorera (kan man vilja ändra, men så är det nu)
      if (this.isDrawing) {
        this.chatMessage = "";
        return;
      }

      // Om jag redan gissat rätt => ignorera
      if (this.correctGuessers.includes(username)) {
        this.chatMessage = "";
        return;
      }

      // Skicka gissning till servern
      socket.emit("guessAttempt", {
        gameID: this.gameID,
        userID: this.userID,
        username: username,
        guess: this.chatMessage
      });

      this.chatMessage = "";
    },

    generateUnderscores(word) {
      if (!word) return "";
      return word
        .split(" ")
        .map(w => w.replace(/./g, "_").split("").join(" "))
        .join("   ");
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