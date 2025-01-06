<template>
  <div class="drawing-area"
       @mousedown="startDrawing"
       @mousemove="draw"
       @mouseup="stopDrawing"
       @mouseleave="stopDrawing">
    <canvas ref="canvas" width="780" height="500"></canvas>
    <div v-if="(this.canDraw)" class="tools-container">
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
import io from 'socket.io-client';
import GameButtons from '@/components/GameButtons.vue';

const socket = io('http://localhost:3000');

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
      ctx: null,
    }
  },
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext('2d');

    // Get existing drawings when mounted
    socket.emit('getDrawings', this.$route.params.id);

    socket.on('drawing', (data) => {
      this.drawFromSocket(data);
    });

    socket.on('existingDrawings', (drawings) => {
      drawings.forEach(data => this.drawFromSocket(data));
    });

    socket.on('undo', () => {
      if (this.strokes.length > 0) {
        this.strokes.pop();
        this.redrawCanvas();
      }
    });

    socket.on('clearCanvas', () => {
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
      if (!this.isDrawing || !this.canDraw) return;

      const currentX = event.offsetX;
      const currentY = event.offsetY;

      // Rita lokalt först
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(currentX, currentY);
      this.ctx.strokeStyle = this.penColor;
      this.ctx.lineWidth = this.lineWidth;
      this.ctx.stroke();
      this.ctx.closePath();

      // Skicka ritdata till andra spelare DIREKT
      const drawData = {
        gameID: this.$route.params.id,
        x1: this.lastX,
        y1: this.lastY,
        x2: currentX,
        y2: currentY,
        color: this.penColor,
        lineWidth: this.lineWidth
      };

      // Emittera till servern
      socket.emit('drawing', drawData);

      // Spara till currentStroke
      this.currentStroke.push({
        x1: this.lastX,
        y1: this.lastY,
        x2: currentX,
        y2: currentY,
        color: this.penColor,
        lineWidth: this.lineWidth
      });

      this.lastX = currentX;
      this.lastY = currentY;
    },
    stopDrawing() {
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
      }
      this.isDrawing = false;
    },
    drawFromSocket(data) {
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.lineWidth;
      ctx.moveTo(data.x1, data.y1);
      ctx.lineTo(data.x2, data.y2);
      ctx.stroke();
      ctx.closePath();
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
      this.redrawCanvas();
      socket.emit('undo');
    },
    resetCanvas() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.strokes = [];
      socket.emit('clearCanvas', this.$route.params.id);
    },
    redrawCanvas() {
      this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.strokes.forEach(stroke => {
        stroke.forEach(segment => {
          this.drawFromSocket(segment);
        });
      });
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
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 5px;
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