<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center">
  

      <!-- Drawing Board -->
      <v-col cols="12" md="6" class="justify-center">
        <v-card class="drawing-card mx-auto mt-5 elevation-10 rounded-lg" max-width="580">
          <v-card-title class="text-h5 font-weight-bold">Drawing Board</v-card-title>
          <v-card-text>
            <canvas
              ref="drawingCanvas"
              class="drawing-canvas"
              @mousedown="startDrawing"
              @mouseup="stopDrawing"
              @mousemove="draw"
              @mouseleave="stopDrawing"
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

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Get user data from localStorage
const user = computed(() => localStorage.getItem('username'))
const access_token = computed(() => localStorage.getItem('access_token'))

const journalText = ref('')
const total_entries = ref('')
const showSnackbar = ref(false)
const successMessage = ref('')
const snackbarTimeout = 2000 // Snackbar will be visible for 2 seconds

const journalEntries = ref([]) // Reactive variable to store journal entries

// Drawing board variables
const drawingCanvas = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)
const selectedColor = ref('#000000')
const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

const submitJournalEntry = async () => {
  const success = await authStore.add(journalText.value, access_token.value)
  showSnackbar.value = true

  if (success) {
    successMessage.value = "Added"
    journalText.value = '' // Clear the textarea after submission
    listJournal() // Refresh the list of journal entries
  } else {
    successMessage.value = "Can't Submit Empty Thoughts"
    journalText.value = '' // Clear the textarea after submission
  }
}

const listJournal = async () => {
  const response = await authStore.list(access_token.value)
  if (response.data.text) {
    total_entries.value = response.data.total_entries
    journalEntries.value = response.data.text.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
}

// Drawing functions
const startDrawing = (event) => {
  isDrawing.value = true
  draw(event)
}

const stopDrawing = () => {
  isDrawing.value = false
  ctx.value.beginPath() // Reset the path
}

const draw = (event) => {
  if (!isDrawing.value) return
  ctx.value.lineWidth = 5
  ctx.value.lineCap = 'round'
  ctx.value.strokeStyle = selectedColor.value

  ctx.value.lineTo(event.offsetX, event.offsetY)
  ctx.value.stroke()
  ctx.value.beginPath()
  ctx.value.moveTo(event.offsetX, event.offsetY)
}

const clearCanvas = () => {
  ctx.value.clearRect(0, 0, drawingCanvas.value.width, drawingCanvas.value.height)
}

onMounted(() => {
  ctx.value = drawingCanvas.value.getContext('2d')
  drawingCanvas.value.width = 580 // Set canvas width
  drawingCanvas.value.height = 400 // Set canvas height
})


</script>

<style scoped>
.home-container {
  background: linear-gradient(to right, #6a11cb, #2575fc);
  min-height: 100vh;
  padding-top: 100px;
}

.v-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.drawing-card {
  margin-top: 20px;
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


