<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center">
  

      <!-- Drawing Board -->
      <v-col class="justify-center">
        <v-card class="drawing-card mx-auto elevation-10 rounded-lg">
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

    

    onMounted(() => {
      ctx.value = canvas.value.getContext('2d');
      socket.value = new WebSocket('ws://localhost:3001');

      socket.value.onopen = () => {
        socket.value.send(JSON.stringify({
          type: 'register',
          username: localStorage.getItem('username') // Assuming the username is stored in localStorage
        }));
      };

      socket.value.onmessage = (event) => {
        const line = JSON.parse(event.data);
        if (line.type === 'invite') {
          inviteFrom.value = line.from;
          inviteDialog.value = true; // Show the invite dialog
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

    const sendInvite = () => {
      if (inviteUsername.value) {
        socket.value.send(JSON.stringify({
          type: 'invite',
          username: inviteUsername.value,
          from: username.value
        }));
        inviteUsername.value = ''; // Clear the input after sending
      }
    };

    const acceptInvite = () => {
      // Logic to join the collaboration
      inviteDialog.value = false; // Close the dialog
      // You can set a state to indicate that the user is in a collaboration session
      console.log(`${inviteFrom.value} accepted the invite to draw together.`);
      // Notify the inviter
      socket.value.send(JSON.stringify({
        type: 'invite-accepted',
        from: username.value,
        to: inviteFrom.value
      }));
    };

    const declineInvite = () => {
      inviteDialog.value = false; // Close the dialog
      console.log(`${inviteFrom.value} declined the invite.`);
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
    };
  },
};
</script>



<style scoped>
.home-container {
  background: linear-gradient(to right, #6a11cb, #2575fc);
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


