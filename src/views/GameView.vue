<template>
  <div>
    <div v-if="currentRound <= gameData.gameRounds">
      <GameInfoComponent 
        :wordOptions="isDrawing ? wordOptions : []"
        :currentWord="displayedWord"
        :timer="timer"
        :currentRound="currentRound"
        @select-word="selectWord"
        @leave-game="handleLeaveGame"
      />
    </div>
    <div v-if="currentRound <= gameData.gameRounds">
      <div class="status-message">
        <p  v-if="drawerName && isDrawing && !currentWord">{{ drawerName }} {{uiLabels.choosingWord}}</p>
        <p  v-else-if="drawerName && isDrawing && currentWord">{{ drawerName }} {{uiLabels.isDrawing}}</p>
        <p v-else-if="drawerName && !isDrawing && currentWord">{{ drawerName }} {{uiLabels.isDrawing}}</p>
        <p v-else-if="drawerName && !isDrawing && !currentWord">{{ drawerName }} {{uiLabels.choosingWord}}</p>
      </div>
      <div class="game-area">
        
        <LeaderboardComponent
          :participants="gameData.participants"
          :userScores="userScores"
          class="leaderboardComp"
        />
        <DrawingComponent
          ref="drawingComp"
          :currentWord="currentWord"
          :canDraw="isDrawing"
          class="drawingComp"
        />
        <ChatComponent
          :messages="messages"
          :chatMessage="chatMessage"
          :canDraw="isDrawing"
          :canGuess="!hasGuessedRight"
          @sendChatMessage="sendChatMessage"
          @updateChatMessage="chatMessage = $event"
          class="chatComp"
        />
      </div>
    </div>

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
        const drawerID = participantIDs[this.currentDrawerIndex] || '';
        return participants[drawerID]?.name || '';
    },
  },

  created() {
    socket.on("uiLabels", labels => this.uiLabels = labels );
    socket.emit("getUILabels", this.lang );
    this.gameID = this.$route.params.id;
    this.userID = this.$route.params.userID;

    socket.emit("joinGame", this.gameID);
    socket.emit("getGameData", { gameID: this.gameID });

    socket.on("getGameData", (gameData) => {
      console.log("Game data received:", gameData);
      this.gameData = gameData;
      this.timer = gameData.drawTime; 
      this.currentRound = gameData.currentRound; 

      if (gameData.currentDrawerIndex !== undefined) {
        this.currentDrawerIndex = gameData.currentDrawerIndex;
      }
      const myParticipant = gameData.participants[this.userID];
        if (myParticipant && myParticipant.guessedCorrectly) {
          this.hasGuessedRight = true;
        } else {
            this.hasGuessedRight = false;
          }
      if (gameData.currentWord) {
        this.currentWord = gameData.currentWord;
      } else {
        this.currentWord = '';
      }
      this.determineIfDrawing();
    });

      socket.on("participantsUpdate", (participants) => {
      this.gameData.participants = participants;

      const updatedScores = {};
      for (const userID in participants) {
        if (userID in this.userScores) {
          updatedScores[userID] = this.userScores[userID];
        } else {
          updatedScores[userID] = 0;
        }
      }
      this.userScores = updatedScores;
      this.determineIfDrawing();
    });

    socket.on('timerStarted', ({ time }) => {
      this.timer = time;
      this.startTimer();
   });

    socket.on("sendChatHistory", (chatHistory) => {
      this.messages = chatHistory;
    });

    socket.on("selectedWord", (word) => {
      if (word) {
        this.gameData.currentWord = word;
        this.currentWord = word;
        this.showWordOptions = false;
      }
    });

    socket.on("correctGuessAnnouncement", (data) => {
      this.messages.push({
        username: data.username,
        text: "guessed correctly!",
      });

      if (data.userID === this.userID) {
      this.hasGuessedRight = true;
      }
    });

    socket.on("scoresUpdated", (updatedScores) => {
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
      this.messages = []; 
      this.currentWord = '';
      this.hasGuessedRight = false;
    });

    socket.on("clearChat", () => {
      this.messages = []; 
    });
  },

  methods: {
    determineIfDrawing() {
      const participantIDs = Object.keys(this.gameData.participants || {});
      if (!participantIDs.length) {
        this.isDrawing = false;
        return;
      }
      if (this.currentDrawerIndex >= participantIDs.length) {
        this.currentDrawerIndex = 0;
      }

      const currentDrawerID = participantIDs[this.currentDrawerIndex];
      this.isDrawing = (currentDrawerID === this.userID);

      if (this.isDrawing) {
        if (!this.gameData.currentWord && this.gameData.theme && this.gameData.wordsLanguage) {
          this.generateWordOptions();
        } else if (this.gameData.currentWord) {
          this.currentWord = this.gameData.currentWord;
        }
      } else {
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
        themeKey = themeMapping[themeKey];
        words = wordsSv[themeKey];
      } else if (this.gameData.wordsLanguage === "English" && reverseThemeMapping[themeKey]) {
        themeKey = reverseThemeMapping[themeKey];
        words = wordsEn[themeKey];
      } else if (this.gameData.wordsLanguage === "English") {
        words = wordsEn[themeKey];
      } else {
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

      if (this.isDrawing) {
        this.chatMessage = "";
        return;
      }

      if (this.correctGuessers.includes(username)) {
        this.chatMessage = "";
        return;
      }

      socket.emit("guessAttempt", {
        gameID: this.gameID,
        userID: this.userID,
        username: username,
        guess: this.chatMessage
      });

      this.chatMessage = "";
    },

    generateUnderscores(word) {
      return word
        .split('')
        .map(char => char === ' ' ? '   ' : '_ ')
        .join('')
        .trimEnd();
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
  height: 50px;
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

@media (max-width: 768px) {
  .game-area {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 10px;
  }

  .status-message {
  height: 10px; 
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 0.7em;
  border-radius: 5px;
  margin-top: 3px;
  margin-bottom: 3px;
}
  
  .drawingComp {
    order: 1;
  }
  .chatComp {
    order: 2;
  }
  .leaderboardComp {
    order: 3;
  }
 
}
</style>