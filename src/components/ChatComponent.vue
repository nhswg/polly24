<template>
    <div class="chat">
      <h3>Chat</h3>
      <div class="messages">
        <div v-for="(msg, index) in messages" :key="index">
          <strong>{{ msg.username }}:</strong> {{ msg.text }}
        </div>
      </div>
      <input 
        v-model="localChatMessage"
        @keyup.enter="emitChatMessage"
        placeholder="Type your guess here..." 
      />
      <button @click="emitChatMessage">Send</button>
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
      }
    },
    data() {
      return {
        localChatMessage: this.chatMessage
      }
    },
    watch: {
      chatMessage(newVal) {
        this.localChatMessage = newVal;
      }
    },
    methods: {
      emitChatMessage() {
        this.$emit('updateChatMessage', this.localChatMessage);
        this.$emit('sendChatMessage');
      }
    }
  }
  </script>
  
  <style scoped>
  .chat {
    border: 1px solid #000;
  }
  .messages {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 10px;
  }
  </style>