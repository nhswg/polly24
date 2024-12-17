<template>
  <div class="drawing-area"
       @mousedown="startDrawing"
       @mousemove="draw"
       @mouseup="stopDrawing"
       @mouseleave="stopDrawing">
    <canvas ref="canvas" width="780" height="500"></canvas>
    <div v-if="currentWord" class="tools-container">
      <div class="current-color" :style="{ backgroundColor: penColor }"></div>
      <GameButtons 
        :changeStrokeColor="changeStrokeColor"
        :changeLineWidth="changeLineWidth"
        :undoLastStroke="undoLastStroke"
        :resetCanvas="resetCanvas"
      />
    </div>
  </div>
</template>

<script>
import GameButtons from '@/components/GameButtons.vue';
import io from 'socket.io-client';

export default {
  name: 'DrawingComponent',
  components: {
    GameButtons
  },
  props: {
    currentWord: {
      type: String,
      default: ''
    },
    canDraw: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      isDrawing: false,
      lastX: 0,
      lastY: 0,
      penColor: '#000000',
      lineWidth: 7,
      strokes: [],
      currentStroke: [],
      socket: null,
      ctx: null,
    }
  },
  mounted() {
    this.socket = io('http://localhost:3000');

    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext('2d');

    this.socket.on('drawing', (data) => {
      this.drawFromSocket(data);
    });

    this.socket.on('undo', () => {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.redrawCanvas();
      }
    });

    this.socket.on('clearCanvas', () => {
    this.strokes = [];
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    });
  },
  methods: {
    startDrawing(event) {
      if (!this.canDraw) return;

      this.isDrawing = true;
      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
      this.currentStroke = [];
    },
    draw(event) {
      if (!this.isDrawing) return;

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = this.penColor;
      ctx.lineWidth = this.lineWidth;
      ctx.beginPath();
      ctx.moveTo(this.lastX, this.lastY);
      ctx.lineTo(event.offsetX, event.offsetY);
      ctx.stroke();

      this.currentStroke.push({
        x1: this.lastX,
        y1: this.lastY,
        x2: event.offsetX,
        y2: event.offsetY,
        color: this.penColor,
        lineWidth: this.lineWidth,
      });

      this.socket.emit('drawing', {
        x1: this.lastX,
        y1: this.lastY,
        x2: event.offsetX,
        y2: event.offsetY,
        color: this.penColor,
        lineWidth: this.lineWidth,
      });

      this.lastX = event.offsetX;
      this.lastY = event.offsetY;
    },
    stopDrawing() {
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
      }
      this.isDrawing = false;
    },
    drawFromSocket(data) {
      this.ctx.strokeStyle = data.color;
      this.ctx.lineWidth = data.lineWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(data.x1, data.y1);
      this.ctx.lineTo(data.x2, data.y2);
      this.ctx.stroke();
    },
    changeStrokeColor(color) {
      this.penColor = color;
    },
    changeLineWidth(width) {
      this.lineWidth = width;
    },
    
    undoLastStroke() {
      if (this.strokes.length === 0) return;

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      this.strokes.pop();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.strokes.forEach(stroke => {
        stroke.forEach(segment => {
          ctx.strokeStyle = segment.color;
          ctx.lineWidth = segment.width;
          ctx.beginPath();
          ctx.moveTo(segment.x1, segment.y1);
          ctx.lineTo(segment.x2, segment.y2);
          ctx.stroke();
        });
      });
      this.socket.emit('undo');
    },
    resetCanvas() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.strokes = [];
      this.socket.emit('clearCanvas');
    }
  }
}
</script>

<style scoped>
.drawing-area {
  position: relative;
  width: 800px;
  height: 600px;
  border-radius: 5px;
  background-color: #f0f0f0;
}

canvas {
  display: block;
  background-color: white;
  margin: 10px;
}

.tools-container {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.current-color {
  margin-right: 30px;
  margin-top: 10px;
  width: 50px;
  height: 50px;
  border: 2px solid #000;
  border-radius: 5px;
}
</style>