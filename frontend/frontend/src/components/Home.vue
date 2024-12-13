<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center align-center" style="height: 100vh;">
      <v-col class="d-flex justify-center align-center">
        <v-btn @click="startSession">Start Session</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useDrawingStore } from '@/stores/drawingStore';
import axios from 'axios';

export default {
  setup() {
    const drawingStore = useDrawingStore();

    const startSession = async () => {
      try {
        const response = await axios.post('YOUR_API_ENDPOINT');
        drawingStore.setSessionData(response.data);
      } catch (error) {
        console.error('Error starting session:', error);
      }
    };

    return {
      startSession,
    };
  },
};
</script>

<style scoped>
.home-container {
  /* background: linear-gradient(to right, #6a11cb, #2575fc); */
  padding-top: 1em;
}

.v-card {
  border-radius: 16px;
  background-color: white;
  color: black;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.drawing-card {
  padding: 20px;
}

.snackbar {
  border-radius: 8px;
  font-weight: bold;
}
</style>


