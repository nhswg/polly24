<template>
  <div class="drawing-area"
       @mousedown="startDrawing"
       @mousemove="draw"
       @mouseup="stopDrawing"
       @mouseleave="stopDrawing"
       @touchstart.prevent="handleTouch($event, startDrawing)"
       @touchmove.prevent="handleTouch($event, draw)"
       @touchend.prevent="stopDrawing">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight"></canvas>
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

const socket = io(sessionStorage.getItem("dataServer"));

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
      currentPath: [],
      canvasWidth: 780,
      canvasHeight: 500,
    }
  },  
  mounted() {
    const canvas = this.$refs.canvas;
    this.ctx = canvas.getContext('2d');
    const gameID = this.$route.params.id;
    socket.emit('joinGame', gameID);

    socket.on('canvasCleared', () => {
        console.log('DrawingComponent: Received canvasCleared event');
        this.strokes = [];
        this.currentPath = [];
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.emit('getDrawings', this.$route.params.id);

    socket.on('drawing', (data) => {
      this.drawFromSocket(data);
    });

    socket.on('existingDrawings', (drawings) => {
      drawings.forEach(data => this.drawFromSocket(data));
    });

    socket.on('undoStroke', (updatedStrokes) => {
    this.strokes = updatedStrokes;
    this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
    updatedStrokes.forEach(stroke => {
      this.drawFromSocket(stroke);
    });
  });

    socket.on('canvasCleared', () => {
        console.log('DrawingComponent: Received canvasCleared event');
        this.strokes = [];
        this.currentPath = [];
        if (this.ctx) {
            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
            console.log('DrawingComponent: Canvas cleared locally');
        }
    });

    this.adjustCanvasSize();
    window.addEventListener('resize', this.adjustCanvasSize);
},
  methods: {
    normalizePoint(x, y, rect) {
      // Konvertera till relativa koordinater (0-1)
      const normalizedX = x / rect.width;
      const normalizedY = y / rect.height;
      
      // Konvertera till canvas-koordinater
      return [
        normalizedX * this.canvasWidth,
        normalizedY * this.canvasHeight
      ];
    },

    startDrawing(event) {
      if (!this.canDraw) return;
      
      this.isDrawing = true;
      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const point = this.normalizePoint(x, y, rect);
      this.currentPath = [point];
      this.lastX = point[0];
      this.lastY = point[1];
      this.currentStroke = [];
    },

    draw(event) {
      if (!this.isDrawing || !this.canDraw) return;

      const rect = this.$refs.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      const point = this.normalizePoint(x, y, rect);
      this.currentPath.push(point);
      
      this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.redrawCanvas();

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
    const gameID = this.$route.params.id;
    socket.emit('undo', gameID);
    },
    resetCanvas() {
        const gameID = this.$route.params.id;
        console.log('DrawingComponent: Emitting clearCanvas for game:', gameID);
        socket.emit('clearCanvas', gameID);
    },
    redrawCanvas() {
      this.ctx.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height);
      this.strokes.forEach(stroke => {
        this.drawFromSocket(stroke);
      });
    },
    handleTouch(touchEvent, handler) {
      const touch = touchEvent.touches[0];
      const rect = this.$refs.canvas.getBoundingClientRect();
      
      const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        preventDefault: () => {}
      };
      
      handler(mouseEvent);
    },
    adjustCanvasSize() {
      if (window.innerWidth <= 768) {
        // Behåll samma proportioner som desktop-versionen
        const aspectRatio = 780/500;
        const width = Math.min(window.innerWidth * 0.95, 780);
        const height = width / aspectRatio;
        this.canvasWidth = 780; // Använd fast bredd
        this.canvasHeight = 500; // Använd fast höjd
      } else {
        this.canvasWidth = 780;
        this.canvasHeight = 500;
      }
      this.redrawCanvas();
    },
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
  touch-action: none; /* Prevent scrolling while drawing */
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

@media (max-width: 768px) {
  .drawing-area {
  position: relative;
  width: 100%;
  height: auto;
  max-width: 95vw;
  margin: 0 auto;
  border-radius: 5px;
  background-color: #f0f0f0;
  aspect-ratio: 780/500; /* Behåll samma proportioner som desktop */
}

canvas {
  position: center;
  margin: 6px;
  width: 96%;
  height: 100%;
  aspect-ratio: 780/500;
  object-fit: contain;
  touch-action: none;
}

.tools-container {
  display: flex;
  align-items: center;
  margin-left: 5px;
  padding: 5px;
  gap: 5px;
  justify-content: center;
}

.current-color {
  margin-right: 30px;
  margin-top: 35px;
  width: 50px;
  height: 50px;
  border: 2px solid #000;
  border-radius: 5px;
}

}
</style>