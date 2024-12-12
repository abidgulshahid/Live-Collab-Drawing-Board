<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center">
  

      <!-- Drawing Board -->
      <v-col class="justify-center">
        <v-card class="drawing-card mx-auto  elevation-10 rounded-lg " >
          <v-card-title class="text-h5 font-weight-bold">Drawing Board</v-card-title>
          <v-card-text>
            <canvas
              ref="canvas"
              @mousedown="startDrawing"
              @mouseup="stopDrawing"
              @mousemove="draw"
              width="1300"
              height="600"
              style="border: 1px solid black;"
            ></canvas>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" @click="clearCanvas">Clear</v-btn>
            <v-select
              v-model="selectedColor"
              :items="colors"
              label="Select Color"
              class="ml-2"
              color="black"
            ></v-select>
            <v-select
              v-model="selectedPenSize"
              :items="penSizes"
              label="Select Pen Size"
              class="ml-2"
              color="black"
            ></v-select>
            <v-text-field
              v-model="username"
              label="Enter Username"
              class="ml-2"
            ></v-text-field>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Snackbar for success message -->
      <v-snackbar
        v-model="showSnackbar"
        :timeout="snackbarTimeout"
        top
        right
        class="snackbar"
      >
        {{ successMessage }}
      </v-snackbar>
    </v-row>

    <!-- Other sections for journal entries... -->
  </v-container>
</template>



<script>
import { ref, onMounted } from 'vue';
import { useDrawingStore } from '@/stores/drawingStore';

export default {
  setup() {
    const canvas = ref(null);
    const ctx = ref(null);
    const isDrawing = ref(false);
    const lastX = ref(0);
    const lastY = ref(0);
    const drawingStore = useDrawingStore();
    const socket = ref(null);
    const username = ref('');
    const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']
    const selectedColor = ref('#000000');

    

    onMounted(() => {
      ctx.value = canvas.value.getContext('2d');
      socket.value = new WebSocket('ws://localhost:3001');

      socket.value.onmessage = (event) => {
        const line = JSON.parse(event.data);
        drawLine(line.x, line.y, line.lastX, line.lastY, line.username);
      };
    });

    const startDrawing = (event) => {
      isDrawing.value = true;
      [lastX.value, lastY.value] = [event.offsetX, event.offsetY];
    };

    const stopDrawing = () => {
      isDrawing.value = false;
    };

    const draw = (event) => {
      if (!isDrawing.value) return;
      const { offsetX, offsetY } = event;
      ctx.value.strokeStyle = selectedColor.value;
      drawLine(offsetX, offsetY, lastX.value, lastY.value);
      socket.value.send(JSON.stringify({
        username: username.value,
        x: offsetX,
        y: offsetY,
        lastX: lastX.value,
        lastY: lastY.value
      }));
      [lastX.value, lastY.value] = [offsetX, offsetY];
    };

    const drawLine = (x, y, lastX, lastY, user) => {
      ctx.value.beginPath();
      ctx.value.moveTo(lastX, lastY);
      ctx.value.lineTo(x, y);
      ctx.value.strokeStyle = selectedColor.value;
      ctx.value.stroke();
    };

    return {
      canvas,
      startDrawing,
      stopDrawing,
      draw,
    };
  },
};
</script>



<style scoped>
.home-container {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  /* min-height: 100vh; */
  padding-top: 100px;
}

.v-card {
  border-radius: 16px;
  background-color: white;
  color: black;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}



.drawing-canvas {
  border: 1px solid #ccc;
  border-radius: 8px;
  width: 100%;
  height: 400px;
}

.snackbar {
  border-radius: 8px;
  font-weight: bold;
}
</style>


