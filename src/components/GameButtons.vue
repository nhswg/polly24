<template>
    <button class="button-container" v-on:click="changeStrokeColor('#ffffff')"><img src="/img/ffffff.png" alt="White" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#000000')"><img src="/img/Black.png" alt="Black" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#3f48cc')"><img src="/img/3f48cc.png" alt="Blue" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#0dae3b')"><img src="/img/0dae3b.png" alt= "Green"></button>
        <button class="button-container" v-on:click="changeStrokeColor('#8cfffb')"><img src="/img/8cfffb.png" alt="Lightblue" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#724a33')"><img src="/img/724a33.png" alt="Brown" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#88238a')"><img src="/img/88238a.png" alt="Purple" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#888888')"><img src="/img/888888.png" alt="Grey" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#ff3d7b')"><img src="/img/ff3d7b.png" alt="Pink" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#ff7f27')"><img src="/img/ff7f27.png" alt= "Orange"></button>
        <button class="button-container" v-on:click="changeStrokeColor('#fff200')"><img src="/img/fff200.png" alt="Yellow" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#EC1C24')"><img src="/img/ec1c24.png" alt="Red" /> </button>

        <button class="button-container" v-on:click="changeLineWidth('2')"><img src="/img/1.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('7')"><img src="/img/2.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('15')"><img src="/img/3.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('20')"><img src="/img/4.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('50')"><img src="/img/5.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeLineWidth('100')"><img src="/img/6.jpg" alt="White" /></button>
        <button class="button-container" v-on:click="changeStrokeColor('#FFFFFF')"><img src="/img/sudd.png" alt="Eraser" /></button>
        <button class="button-container" v-on:click="undoLastStroke()"><img src="/img/undo.jpg" alt="Undo" /></button>
        <button class="button-container" v-on:click="resetCanvas()"><img src="/img/reset.png" alt="Reset" /></button>
</template>

<script>
export default {
  name: 'GameButtons',
  methods: {
    changeStrokeColor(color) {
      this.penColor = color;   
    },
    changeLineWidth(width) {
      this.lineWidth = width;
    },
    undoLastStroke() {
      if (this.strokes.length === 0) return;

      this.strokes.pop(); 

      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
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
    },
    resetCanvas() {
      const canvas = this.$refs.canvas;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }
}
</script>

<style>

.button-container {
  border: 0.1em solid black;
  padding: 0;
}
.button-container img {
  display: block;
    width: 30px;
    height: auto;
    background-color: white;
}

</style>