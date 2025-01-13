<template>
  <div class="game-buttons">
    
    <button class="button-container" @click="changeStrokeColor('#ffffff')" @touchstart.prevent="changeStrokeColor('#ffffff')"><img src="/img/ffffff.png" alt="White" /></button>
    <button class="button-container" @click="changeStrokeColor('#888888')" @touchstart.prevent="changeStrokeColor('#888888')"><img src="/img/888888.png" alt="Grey" /></button>
    <button class="button-container" @click="changeStrokeColor('#000000')" @touchstart.prevent="changeStrokeColor('#000000')"><img src="/img/Black.png" alt="Black" /></button>
    <button class="button-container" @click="changeStrokeColor('#724a33')" @touchstart.prevent="changeStrokeColor('#724a33')"><img src="/img/724a33.png" alt="Brown" /></button>
    <button class="button-container" @click="changeStrokeColor('#EC1C24')" @touchstart.prevent="changeStrokeColor('#EC1C24')"><img src="/img/ec1c24.png" alt="Red" /></button>
    <button class="button-container" @click="changeStrokeColor('#ff7f27')" @touchstart.prevent="changeStrokeColor('#ff7f27')"><img src="/img/ff7f27.png" alt= "Orange"></button>
    <button class="button-container" @click="changeStrokeColor('#fff200')" @touchstart.prevent="changeStrokeColor('#fff200')"><img src="/img/fff200.png" alt="Yellow" /></button>
    <button class="button-container" @click="changeStrokeColor('#0dae3b')" @touchstart.prevent="changeStrokeColor('#0dae3b')"><img src="/img/0dae3b.png" alt= "Green"></button>
    <button class="button-container" @click="changeStrokeColor('#3f48cc')" @touchstart.prevent="changeStrokeColor('#3f48cc')"><img src="/img/3f48cc.png" alt="Blue" /></button>
    <button class="button-container" @click="changeStrokeColor('#8cfffb')" @touchstart.prevent="changeStrokeColor('#8cfffb')"><img src="/img/8cfffb.png" alt="Lightblue" /></button>
    <button class="button-container" @click="changeStrokeColor('#88238a')" @touchstart.prevent="changeStrokeColor('#88238a')"><img src="/img/88238a.png" alt="Purple" /></button>
    <button class="button-container" @click="changeStrokeColor('#ff3d7b')" @touchstart.prevent="changeStrokeColor('#ff3d7b')"><img src="/img/ff3d7b.png" alt="Pink" /></button>

    <button class="button-container" @click="changeLineWidth('2')" @touchstart.prevent="changeLineWidth('2')"><img src="/img/1.jpg" alt="linewidth 2" /></button>
    <button class="button-container" @click="changeLineWidth('7')" @touchstart.prevent="changeLineWidth('7')"><img src="/img/2.jpg" alt="linewidth 7" /></button>
    <button class="button-container" @click="changeLineWidth('15')" @touchstart.prevent="changeLineWidth('15')"><img src="/img/3.jpg" alt="linewidth 15" /></button>
    <button class="button-container" @click="changeLineWidth('20')" @touchstart.prevent="changeLineWidth('20')"><img src="/img/4.jpg" alt="linewidth 20" /></button>
    <button class="button-container" @click="changeLineWidth('50')" @touchstart.prevent="changeLineWidth('50')"><img src="/img/5.jpg" alt="linewidth 50" /></button>
    <button class="button-container" @click="changeLineWidth('100')" @touchstart.prevent="changeLineWidth('100')"><img src="/img/6.jpg" alt="linewidth 100" /></button>

    <div class="utility-buttons">
      <button class="button-container" @click="changeStrokeColor('#FFFFFF')" @touchstart.prevent="changeStrokeColor('#FFFFFF')"><img src="/img/sudd.png" alt="Eraser" /></button>
      <button class="button-container" 
              @mousedown="startUndo" 
              @mouseup="stopUndo"
              @mouseleave="stopUndo"
              @touchstart.prevent="singleUndo">
        <img src="/img/undo.jpg" alt="Undo" />
      </button>
      <button class="button-container" @click="resetCanvas" @touchstart.prevent="resetCanvas"><img src="/img/reset.png" alt="Reset" /></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GameButtons',
  props: {
    changeStrokeColor: {
      type: Function,
      required: true
    },
    changeLineWidth: {
      type: Function,
      required: true
    },
    undoLastStroke: {
      type: Function,
      required: true
    },
    resetCanvas: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      undoInterval: null,
    }
  },
  methods: {
    startUndo() {
      this.undoInterval = setInterval(this.undoLastStroke, 100);
    },
    stopUndo() {
      clearInterval(this.undoInterval);
      this.undoInterval = null;
    },
    singleUndo() {
      this.undoLastStroke();
    }
  }
}
</script>

<style scoped>
.game-buttons {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.utility-buttons {
  display: flex;
  flex-wrap: wrap;
  margin-left: 10px;
}

.button-container {
  border: 0.1em solid black;
  padding: 0;
  background-color: white;
  touch-action: manipulation; 
}

.button-container img {
  display: block;
  width: 30px;
  height: auto;
  background-color: white;
}

@media (max-width: 768px) {
  .game-buttons {
    justify-content: center;
    flex-direction: row; 
    align-items: center;
    margin-top: 30px;
    margin-right: 20px;
    margin-left: -10px;
  }

  .utility-buttons {
    justify-content: center;
    margin-left: 0;
    position: static; 
    transform: none;
    flex-direction: row; 
  }

  .button-container {
    margin: 3px;
  }

  .button-container img {
    width: 15px; 
  }
}
</style>