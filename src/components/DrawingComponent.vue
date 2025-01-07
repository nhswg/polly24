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
import getStroke from 'perfect-freehand';

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
      currentPath: [], // Add this for storing the current drawing points
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

  // Nytt: Hämta canvasens position relativt till viewport
  const rect = this.$refs.canvas.getBoundingClientRect();

  // Nytt: Beräkna musens position relativt till canvasen
  const point = [event.clientX - rect.left, event.clientY - rect.top];

  this.currentPath = [point];
  this.lastX = event.clientX - rect.left; // Nytt: Uppdatera med beräknade koordinater
  this.lastY = event.clientY - rect.top; // Nytt: Uppdatera med beräknade koordinater
  this.currentStroke = [];
},

draw(event) {
  if (!this.isDrawing || !this.canDraw) return;

  // Nytt: Hämta canvasens position relativt till viewport
  const rect = this.$refs.canvas.getBoundingClientRect();

  // Nytt: Beräkna musens position relativt till canvasen
  const point = [event.clientX - rect.left, event.clientY - rect.top];

  this.currentPath.push(point);

  // Rensa canvasen och rita om allt
  this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
  this.redrawCanvas();

  // Rita den aktuella stroke
  const stroke = getStroke(this.currentPath, {
    size: this.lineWidth,
    thinning: 0.5,
    smoothing: 0.5,
    streamline: 0.5,
  });

  if (stroke.length > 0) {
    this.ctx.beginPath();
    this.ctx.fillStyle = this.penColor;

    const [first, ...rest] = stroke;
    this.ctx.moveTo(first[0], first[1]);

    for (const point of rest) {
      this.ctx.lineTo(point[0], point[1]);
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  // Skicka ritdata via socket
  const drawData = {
    gameID: this.$route.params.id,
    points: this.currentPath,
    color: this.penColor,
    lineWidth: this.lineWidth,
  };

  socket.emit('drawing', drawData);
},


    stopDrawing() {
      if (this.currentPath.length > 0) {
        this.strokes.push({
          points: [...this.currentPath],
          color: this.penColor,
          lineWidth: this.lineWidth
        });
      }
      this.currentPath = [];
      this.isDrawing = false;
    },
    drawFromSocket(data) {
      if (Array.isArray(data.points)) {
        const stroke = getStroke(data.points, {
          size: data.lineWidth,
          thinning: 0.5,
          smoothing: 0.5,
          streamline: 0.5,
        });

        if (stroke.length > 0) {
          this.ctx.beginPath();
          this.ctx.fillStyle = data.color;
          
          const [first, ...rest] = stroke;
          this.ctx.moveTo(first[0], first[1]);
          
          for (const point of rest) {
            this.ctx.lineTo(point[0], point[1]);
          }
          
          this.ctx.closePath();
          this.ctx.fill();
        }
      }
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
        this.drawFromSocket(stroke);
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