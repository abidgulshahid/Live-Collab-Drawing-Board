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
   
              <v-text-field
                v-model="inviteUsername"
                label="Invite Username"
                class="ml-2"
                outlined
              ></v-text-field>
              <v-btn color="primary" @click="sendInvite" class="ml-2">Invite</v-btn>
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
      const inviteUsername = ref('');
      const inviteDialog = ref(false);
      const inviteFrom = ref('');
      const shareCount = ref(0);
      const connectedUsers = ref([]);
  
      
  
      onMounted(() => {
        ctx.value = canvas.value.getContext('2d');
        socket.value = new WebSocket('ws://localhost:3001');
  
        socket.value.onopen = () => {
          socket.value.send(JSON.stringify({
            type: 'register',
            username: localStorage.getItem('username') // Assuming the username is stored in localStorage
          }));
  
          // Retrieve session data from local storage
          const sessionData = JSON.parse(localStorage.getItem('drawingSession'));
          if (sessionData) {
            for (const line of sessionData.lines) {
              drawLine(line.x, line.y, line.lastX, line.lastY, line.username);
            }
            username.value = sessionData.username;
            colors = sessionData.colors;
            selectedColor.value = sessionData.selectedColor;
            inviteUsername.value = sessionData.inviteUsername;
            inviteDialog.value = sessionData.inviteDialog;
            inviteFrom.value = sessionData.inviteFrom;
            shareCount.value = sessionData.shareCount;
            connectedUsers.value = sessionData.connectedUsers;
            // Logic to restore the session (e.g., draw previous lines)
            // You can implement this based on your drawing logic
          }
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
          } else {
            drawLine(line.x, line.y, line.lastX, line.lastY, line.username);
          }
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
          x: offsetX,
          y: offsetY,
          lastX: lastX.value,
          lastY: lastY.value,
          signal: localStorage.getItem('signal')
          
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
  
      const sendInvite = () => {
        if (inviteUsername.value) {
          const uniqueUrl = `http://localhost:3000/join/${inviteUsername.value}`; // Generate a unique URL
          socket.value.send(JSON.stringify({
            type: 'invite',
            username: inviteUsername.value,
            from: localStorage.getItem('username'),
            url: uniqueUrl // Include the URL in the invite
          }));
          inviteUsername.value = ''; // Clear the input after sending
          shareCount.value++;
        }
      };
  
      const acceptInvite = async () => {
        // Logic to join the collaboration
        inviteDialog.value = false; // Close the dialog
        console.log(`${inviteFrom.value} accepted the invite to draw together.`);
        
        // Save session information in local storage
        const sessionInfo = {
          from: localStorage.getItem('username'),
          to: inviteFrom.value,
          // Add any other relevant session data here
        };
        localStorage.setItem('drawingSession', JSON.stringify(sessionInfo));
        localStorage.setItem('signal', true);
  
        // Send session data to the backend
        try {
          await axios.post('http://localhost:4000/api/v1/session', sessionInfo);
          console.log('Session data sent to backend successfully.');
        } catch (error) {
          console.error('Error sending session data to backend:', error);
        }
  
        // Notify the inviter
        socket.value.send(JSON.stringify({
          type: 'invite-accepted',
          from: localStorage.getItem('username'),
          to: inviteFrom.value
        }));
      };
  
      const declineInvite = () => {
        inviteDialog.value = false; // Close the dialog
        console.log(`${inviteFrom.value} declined the invite.`);
      };
  
      // Add a method to handle joining the board via URL
      const joinBoard = (username) => {
        inviteFrom.value = username; // Set the inviter's username
        inviteDialog.value = true; // Show the invite dialog
        // Additional logic to join the board can be added here
      };
  
      return {
        canvas,
        startDrawing,
        stopDrawing,
        draw,
        inviteUsername,
        sendInvite,
        inviteDialog,
        inviteFrom,
        acceptInvite,
        declineInvite,
        shareCount,
        connectedUsers,
        joinBoard,
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
  
  
  