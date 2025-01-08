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
      
      <div class="status-message">
        <p  v-if="drawerName && isDrawing && !currentWord">{{ drawerName }} {{uiLabels.choosingWord}}</p>
        <p  v-else-if="drawerName && isDrawing && currentWord">{{ drawerName }} {{uiLabels.isDrawing}}</p>
        <p v-else-if="drawerName && !isDrawing && currentWord">{{ drawerName }} {{uiLabels.isDrawing}}</p>
        <p v-else-if="drawerName && !isDrawing && !currentWord">{{ drawerName }} {{uiLabels.choosingWord}}</p>
      </div>
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
      <FinalLeaderboardComponent
        v-if="gameData.participants"
        :participants="gameData.participants"
        :userScores="userScores"
        class="final-leaderboard"
      />
      <button @click="handleLeaveGame">{{uiLabels.toHome}}</button>
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
import FinalLeaderboardComponent from '@/components/FinalLeaderboardComponent.vue';

const socket = io(sessionStorage.getItem("dataServer"));

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
    GameInfoComponent,
    FinalLeaderboardComponent
  },
  data() {
    return {
      showWordOptions: true,
      gameData: {},
      timer: 0,
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
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
    };
  },

  computed: {
    displayedWord() {
      return this.isDrawing
        ? this.currentWord
        : this.generateUnderscores(this.currentWord);
    },
    drawerName() {
      const participants = this.gameData.participants || {};
      const participantIDs = Object.keys(participants);
      if (!participantIDs.length) return '';
      // Hämta aktuell tecknare
      const drawerID = participantIDs[this.currentDrawerIndex] || '';
      return participants[drawerID]?.name || '';
    },
  },

  created() {
    socket.on("uiLabels", labels => this.uiLabels = labels );
    socket.emit("getUILabels", this.lang );
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
      this.timer = gameData.drawTime; //Denna visar 90 när man laddar om 
      this.currentRound = gameData.currentRound; // Sync local currentRound

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
      } else {
        this.currentWord = ''; // Ensure currentWord is reset
      }

      // Bestäm vem som tecknar nu
      this.determineIfDrawing();
    });

    // 4. När participants uppdateras
    socket.on("participantsUpdate", (participants) => {
      console.log("participantsUpdate", participants);
      this.gameData.participants = participants;

      // Uppdatera userScores för att ta bort poäng för deltagare som lämnat
      const updatedScores = {};
      for (const userID in participants) {
        if (userID in this.userScores) {
          updatedScores[userID] = this.userScores[userID];
        } else {
          updatedScores[userID] = 0;
        }
      }
      this.userScores = updatedScores;

      // Bestäm vem som är tecknare
      this.determineIfDrawing();
    });

    //timer från servern
    socket.on('timerStarted', ({ time }) => {
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

    socket.on('timerUpdate', ({ remainingTime }) => {
      this.timer = remainingTime;
    });

    socket.on("timerFinished", ({ gameID }) => {
      this.timer = 0;
      this.messages = []; // Rensa chatten när tiden är slut
      this.currentWord = '';
      this.hasGuessedRight = false;
    });

    socket.on("clearChat", () => {
      this.messages = []; // Rensa chatten när clearChat event tas emot
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
      socket.emit("wordSelected", {
        gameID: this.gameID,
        word: this.currentWord
      });

      socket.emit('startGameTimer', { 
        gameID: this.gameID,
        duration: this.gameData.drawTime
       });

    
    },

    handleLeaveGame() {
      socket.emit('leaveGame', { gameID: this.gameID, userID: this.userID });
      socket.disconnect();
      window.location.href = '/';
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

.status-message {
  height: 50px; /* Increased height to accommodate text */
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 1.5em;
  padding: 5px 10px;
  margin: 10px 0;
  background-color: #f0f0f0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #333;

}


</style>