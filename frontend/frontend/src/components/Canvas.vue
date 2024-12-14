<template>
    <v-container fluid class="home-container">
      <v-row no-gutters class="justify-center">
    
  
        <!-- Drawing Board -->
        <v-col class="justify-center">
          <v-card class="drawing-card mx-auto elevation-10 rounded-lg">
            <v-card-actions class="d-flex justify-space-between">
              <v-btn color="secondary" @click="clearCanvas" class="mr-2">Clear</v-btn>
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
              <v-btn color="primary" @click="saveCanvas">Save Drawing</v-btn>
   
            </v-card-actions>
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
  
          </v-card>
        </v-col>
  
        <!-- Save Button -->
        
  
        <!-- Display connected users -->
        <v-card class="mx-auto" style="margin-top: 20px; padding: 10px;">
          <h3>Connected Users</h3>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="user in connectedUsers" :key="user">
                <v-list-item-content>
                  <v-list-item-title>{{ user }}</v-list-item-title>
                  <canvas
                    v-if="user === currentUser"
                    :style="{ position: 'absolute', left: cursorX + 'px', top: cursorY + 'px' }"
                    width="20"
                    height="20"
                    class="cursor"
                  ></canvas>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
  
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
  
        <!-- Invite Notification -->
        <v-dialog v-model="inviteDialog" max-width="290">
          <v-card>
            <v-card-title class="headline">Invite Received</v-card-title>
            <v-card-text>
              {{ inviteFrom }} has invited you to draw together!
            </v-card-text>
            <v-card-actions>
              <v-btn color="green" @click="acceptInvite">Accept</v-btn>
              <v-btn color="red" @click="declineInvite">Decline</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-row>
  
      <!-- Other sections for journal entries... -->
    </v-container>
  </template>
  
  
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useDrawingStore } from '@/stores/drawingStore';
  import axios from 'axios';
  import { useRoute } from 'vue-router'; // Import useRoute

  
  export default {
    setup() {
      const canvas = ref(null);
      const ctx = ref(null);
      const isDrawing = ref(false);
      const lastX = ref(0);
      const lastY = ref(0);
      const drawingStore = useDrawingStore();
      const socket = ref(null);
      const username = ref(localStorage.getItem('username'));
      const colors = ref(['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']);
      const selectedColor = ref('#000000');
      const inviteUsername = ref('');
      const inviteDialog = ref(false);
      const inviteFrom = ref('');
      const shareCount = ref(0);
      const connectedUsers = ref([]);
      const penSizes = ref([1, 2, 5, 10, 15]);
      const selectedPenSize = ref(2);
      const currentUser = ref(username.value);
      const route = useRoute(); // Get the current route


  
      
  
      onMounted(() => {
        ctx.value = canvas.value.getContext('2d');
        socket.value = new WebSocket('ws://localhost:3001');
  
        socket.value.onopen = () => {
          console.log('WebSocket connection established');
          // Register the user
          socket.value.send(JSON.stringify({
            type: 'register',
            username: currentUser.value, // Send the username to the server
 
          }));
  
        };
  
        socket.value.onmessage = (event) => {
          console.log("HELLO")
          const line = JSON.parse(event.data);
          if (line.type === 'invite') {
            inviteFrom.value = line.from;
            inviteDialog.value = true; // Show the invite dialog
          } else if (line.type === 'user-connected') {
            connectedUsers.value.push(line.username); // Add new user to the list
          } else if (line.type === 'user-disconnected') {
            connectedUsers.value = connectedUsers.value.filter(user => user !== line.username); // Remove user from the list
          } else if (line.type === 'cursor-update') {
            drawCursor(line.username, line.x, line.y);
          } else {
            drawLine(line.x, line.y, line.lastX, line.lastY, line.username);
          }
        };
  
        socket.value.onclose = () => {
          console.log('WebSocket connection closed');
        };
  
        socket.value.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
  
        const canvasElement = document.querySelector('canvas');
        canvasElement.addEventListener('mousemove', (event) => {
       
          socket.value.send(JSON.stringify({
            username: currentUser.value,
           
          }));
        });
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
        ctx.value.lineWidth = selectedPenSize.value;
        drawLine(offsetX, offsetY, lastX.value, lastY.value);
        socket.value.send(JSON.stringify({
          x: offsetX,
          y: offsetY,
          lastX: lastX.value,
          lastY: lastY.value,
          
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

  
      const drawCursor = (username, x, y) => {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.fillText(username, x + 12, y);
      };
  
      const saveCanvas = () => {
        const canvasElement = canvas.value; // Get the canvas element
        const dataURL = canvasElement.toDataURL('image/png'); // Convert canvas to image URL
        const link = document.createElement('a'); // Create a link element
        link.href = dataURL; // Set the link's href to the image URL
        link.download = 'drawing.png'; // Set the default file name
        link.click(); // Programmatically click the link to trigger the download
      };
  
      return {
        canvas,
        startDrawing,
        stopDrawing,
        draw,
        connectedUsers,
        colors,
        selectedColor,
        penSizes,
        selectedPenSize,
        currentUser,
    
        saveCanvas,
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
  
  .cursor {
    position: absolute;
    pointer-events: none;
  }
  </style>
  
  
  