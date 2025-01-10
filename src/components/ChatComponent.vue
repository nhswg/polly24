<template>
  <div class="chat">
    <h3>{{ uiLabels.Guesses }}</h3>
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index">
        <!-- Om det är ett systemmeddelande -->
          <div 
          v-if="!msg.username || msg.username.trim() === ''" 
          class="system-message">
            {{ msg.text }}
          </div>
  
        <!-- Om det är ett vanligt meddelande -->
          <div v-else>
            <strong>{{ msg.username }}</strong>: {{ msg.text }}
          </div>
      </div>
    </div>
    <div class="input-container" v-if="!canDraw && canGuess">
      <input 
        v-model="localChatMessage"
        @keyup.enter="emitChatMessage"
        v-bind:placeholder="uiLabels.typeGuess"
      />
      <button @click="emitChatMessage">{{ uiLabels.Send}}</button>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client';
const socket = io("http://localhost:3000");

export default {
  props: {
    messages: {
      type: Array,
      required: true
    },
    chatMessage: {
      type: String,
      required: false,
      default: ''
    },
    canDraw: {
    type: Boolean,
    required: true
  },
  canGuess: {
      type: Boolean,      
      required: true
    }
  },
  data() {
    return {
      localChatMessage: this.chatMessage,
      uiLabels: {},
      lang: localStorage.getItem("lang") || "en",
    };
  },
  watch: {
    messages: {
      handler() {
        this.scrollToBottom();
      },
      deep: true 
    },
    chatMessage(newVal) {
      this.localChatMessage = newVal;
    }
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    emitChatMessage() {
      if (!this.localChatMessage.trim()) return;
        this.$emit('updateChatMessage', this.localChatMessage);
        this.$emit('sendChatMessage');
        this.localChatMessage = '';
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
    }
  },
  created() {
      socket.on("uiLabels", labels => this.uiLabels = labels );
      socket.emit("getUILabels", this.lang );
    }
};
</script>

<style scoped>
.chat {
  background-color: #f0f0f0;
  border-radius: 5px;
  display: flex; 
  flex-direction: column; 
  height: 580px;
  padding: 10px;
}

.messages {
  flex: 1; 
  overflow-y: auto;
  margin-bottom: 10px;
  background: #fff;
  border: 1px solid #ddd;
  padding: 5px;
  border-radius: 5px;
  text-align: left;
}

.input-container {
  display: flex;
  align-items: center;
}

.input-container input {
  flex: 1;
  padding: 5px 10px;
  border-radius: 5px;
  height: 40px; 
  font-size: 16px;
  box-sizing: border-box;
}

.input-container button {
  padding: 5px 15px;
  margin: 5px;
  height: 40px; 
  font-size: 16px;
  background-color: #007BFF;
  color: white;
  border-radius: 5px;
}

.input-container button:hover {
  background-color: #0056b3;
}

.system-message {
  font-weight: bold;
  color: green;
}

@media (max-width: 414px) {
  .chat {
    height: 100px;
    padding-top: 0px;
    font-size: 12px;
    padding: 0px;
    margin: 0px;
  }
 
  .messages {
    width: 95%;
    font-size: 10px;
    padding: 2px;
    margin: 4px;
  }

  h3 {
    font-size: 0.6rem; /* Reduced font size for mobile */
    margin: 0; /* Remove margin */
    padding: 2px ; /* Add padding to control space */
  }

  .input-container input {
    height: 20px;
    font-size: 10px;
    padding: 2px;
    margin: 2px;
  }

  .input-container button {
    height: 20px;
    font-size: 10px;
    padding: 0px 5px;  }
}
</style>