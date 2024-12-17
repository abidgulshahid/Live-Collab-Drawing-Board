<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center">
      <v-col class="justify-center" cols="8">
        <v-card class="drawing-card mx-auto elevation-10 rounded-lg">
          <v-card-actions class="d-flex justify-space-between">
            <v-btn color="secondary" @click="toggleEraser" class="mr-2">
              <v-icon>{{ isEraser ? 'mdi-pencil' : 'mdi-eraser' }}</v-icon>
              {{ isEraser ? 'Draw' : 'Eraser' }}
            </v-btn>
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
            <v-select
              v-model="shapeType"
              :items="['line', 'rectangle', 'circle']"
              label="Select Shape"
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
              :style="{ border: '1px solid black', cursor: isEraser ? 'url(eraser-icon.png) 10 10, auto' : 'crosshair' }"
            ></canvas>
          </v-card-text>
        </v-card>
        <v-card class="chat-card">
          <v-card-title>Chat Room</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item-group v-for="msg in messages" :key="msg.id">
                <v-list-item-content>
                  <v-list-item-title :style="{ color: msg.username === currentUser ? '#f0f0f0' : 'red' }">
                    <strong>{{ msg.username }}:</strong> {{ msg.text }} <span v-if="msg.username === currentUser">(me)</span>
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-text-field v-model="chatMessage" label="Type a message..." @keyup.enter="sendMessage"></v-text-field>
            <v-btn color="primary" @click="sendMessage">Send</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col class="sidebar" cols="4">
        <v-card class="mx-auto" style="margin-top: 20px; padding: 10px;">
          <h3>Connected Users ({{ connectedUsers.length }})</h3>
          <v-list>
            <v-list-item-group>
              <v-list-item v-for="user in connectedUsers" :key="user">
                <v-list-item-content>
                  <v-list-item-title>{{ user }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-snackbar
        v-model="showSnackbar"
        :timeout="snackbarTimeout"
        top
        right
        class="snackbar"
      >
        {{ successMessage }}
      </v-snackbar>
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
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useDrawingStore } from '@/stores/drawingStore';
import axios from 'axios';
import { useRoute } from 'vue-router';

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
    const connectedUsers = ref([]);
    const penSizes = ref([1, 2, 5, 10, 15]);
    const selectedPenSize = ref(2);
    const currentUser = ref(username.value);
    const route = useRoute();

    const getCurrentGroupId = () => {
      return route.params.groupId;
    };

    const chatMessage = ref('');
    const messages = ref([]);
    const isEraser = ref(false);
    const drawnLines = ref([]);
    const shapeType = ref('line');

    onMounted(() => {
      ctx.value = canvas.value.getContext('2d');
      socket.value = new WebSocket(`ws://localhost:3001/boards/${getCurrentGroupId()}`);

      socket.value.onopen = () => {
        console.log('WebSocket connection established');
        socket.value.send(JSON.stringify({
          type: 'register',
          username: currentUser.value,
          uuid: getCurrentGroupId()
        }));
      };

      socket.value.onmessage = (event) => {
        const line = JSON.parse(event.data);
        if (line.type === 'user-list') {
          connectedUsers.value = Array.from(new Set(line.users));
        } else if (line.type === 'user-disconnected') {
          connectedUsers.value = connectedUsers.value.filter(user => user !== line.users);
        } else if (line.type === 'cursor-update') {
          drawCursor(line.username, line.x, line.y);
        } else if (line.type === 'eraser') {
          ctx.value.clearRect(line.x - line.penSize / 2, line.y - line.penSize / 2, line.penSize, line.penSize);
        } else {
          drawLine(line.x, line.y, line.lastX, line.lastY, line.username);
        }
        const message = JSON.parse(event.data);
        if (message.type === 'message') {
          messages.value.push(message);
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

      if (isEraser.value) {
        socket.value.send(JSON.stringify({
          type: 'eraser',
          x: offsetX,
          y: offsetY,
          penSize: selectedPenSize.value,
        }));
        ctx.value.clearRect(offsetX - selectedPenSize.value / 2, offsetY - selectedPenSize.value / 2, selectedPenSize.value, selectedPenSize.value);
      } else {
        if (shapeType.value === 'rectangle') {
          drawRectangle(offsetX, offsetY, lastX.value, lastY.value);
          socket.value.send(JSON.stringify({
            type: 'rectangle',
            x: offsetX,
            y: offsetY,
            lastX: lastX.value,
            lastY: lastY.value,
            penSize: selectedPenSize.value,
            color: selectedColor.value,
          }));
        } else if (shapeType.value === 'circle') {
          drawCircle(offsetX, offsetY, lastX.value, lastY.value);
          socket.value.send(JSON.stringify({
            type: 'circle',
            x: offsetX,
            y: offsetY,
            lastX: lastX.value,
            lastY: lastY.value,
            penSize: selectedPenSize.value,
            color: selectedColor.value,
          }));
        } else {
          drawLine(offsetX, offsetY, lastX.value, lastY.value);
          socket.value.send(JSON.stringify({
            x: offsetX,
            y: offsetY,
            lastX: lastX.value,
            lastY: lastY.value,
            penSize: selectedPenSize.value,
            color: selectedColor.value,
          }));
        }
      }
      [lastX.value, lastY.value] = [offsetX, offsetY];
    };

    const drawLine = (x, y, lastX, lastY, user) => {
      if (isEraser.value) {
        ctx.value.clearRect(x - selectedPenSize.value / 2, y - selectedPenSize.value / 2, selectedPenSize.value, selectedPenSize.value);
      } else {
        ctx.value.beginPath();
        ctx.value.moveTo(lastX, lastY);
        ctx.value.lineTo(x, y);
        ctx.value.strokeStyle = selectedColor.value;
        ctx.value.lineWidth = selectedPenSize.value;
        ctx.value.stroke();
        drawnLines.value.push({ x, y, lastX, lastY, user });
      }
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
      const canvasElement = canvas.value;
      const dataURL = canvasElement.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'drawing.png';
      link.click();
    };

    const toggleEraser = () => {
      isEraser.value = !isEraser.value;
    };

    const redrawCanvas = () => {
      ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
      drawnLines.value.forEach(line => {
        ctx.value.beginPath();
        ctx.value.moveTo(line.lastX, line.lastY);
        ctx.value.lineTo(line.x, line.y);
        ctx.value.strokeStyle = line.user === currentUser.value ? selectedColor.value : 'black';
        ctx.value.lineWidth = selectedPenSize.value;
        ctx.value.stroke();
      });
    };

    const removeUser = (username) => {
      socket.value.send(JSON.stringify({
        type: 'disconnect',
        username: username,
      }));
      connectedUsers.value = connectedUsers.value.filter(user => user !== username);
    };

    const sendMessage = async () => {
      if (chatMessage.value.trim() !== '') {
        const messageToSend = {
          type: 'message',
          username: currentUser.value,
          text: chatMessage.value,
          groupId: getCurrentGroupId(),
        };
        // TODO: Save the chat room in the db + create the rest api for that
        // await axios.post('http://localhost:3000/api/messages', {
        //   username: currentUser.value,
        //   text: chatMessage.value,
        //   groupId: getCurrentGroupId(),
        // });

        socket.value.send(JSON.stringify(messageToSend));
        messages.value.push(messageToSend);
        chatMessage.value = '';
      }
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
      isEraser,
      toggleEraser,
      redrawCanvas,
      removeUser,
      chatMessage,
      messages,
      sendMessage,
    };
  },
};
</script>

<style scoped>
.home-container {
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

.chat-card {
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 470px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
