<template>
  <div class="chat">
    <h3>Guesses</h3>
    <div class="messages" ref="messagesContainer">
      <div v-for="(msg, index) in messages" :key="index">
        <strong>{{ msg.username }}:</strong> {{ msg.text }}
      </div>
    </div>
    <div class="input-container" v-if="!canDraw">
      <input 
        v-model="localChatMessage"
        @keyup.enter="emitChatMessage"
        placeholder="Type your guess here..." 
      />
      <button @click="emitChatMessage">Send</button>
    </div>
  </div>
</template>

<script>
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
  }
  },
  data() {
    return {
      localChatMessage: this.chatMessage
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

</style>
