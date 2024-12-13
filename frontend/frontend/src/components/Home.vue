<template>
  <v-container fluid class="home-container">
    <v-row no-gutters class="justify-center align-center" style="height: 100vh;">
      <v-col class="d-flex flex-column align-center">
        <!-- Section for displaying previous sessions -->
        <div v-if="sessions.length" class="previous-sessions">
          <h3>Previous Sessions</h3>
          <v-list>
            <v-list-item
              v-for="session in sessions"
              :key="session.uuid"
              @click="goToSession(session.uuid)"
            >
              <v-list-item-title>{{ session.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <v-btn @click="openModal">Start Session</v-btn>
      </v-col>
    </v-row>

    <!-- Modal for creating session -->
    <v-dialog v-model="modal" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">Create Session</span>
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="name" label="Enter your name" required></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="createSession">Create Session</v-btn>
          <v-btn @click="closeModal">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useDrawingStore } from '@/stores/drawingStore';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  setup() {
    const drawingStore = useDrawingStore();
    const router = useRouter();
    const modal = ref(false); // Modal visibility state
    const name = ref(''); // Name input state
    const sessions = ref([]); // Array to hold previous sessions

    const openModal = () => {
      modal.value = true; // Open the modal
    };

    const closeModal = () => {
      modal.value = false; // Close the modal
      name.value = ''; // Reset the name input
    };

    const createSession = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/create_session/', {
          access_token: localStorage.getItem('access_token'), 
          name: name.value
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            access_token: localStorage.getItem('access_token'),
          }
        })
        const uuid = response.data.uuid;
        drawingStore.setSessionData(response.data);

        // Redirecting to the next page with the UUID in the URL
        router.push({ path: `/next-page/${uuid}` }); // Replace '/next-page' with your actual route

        closeModal(); // Close the modal after creating the session
      } catch (error) {
        console.error('Error creating session:', error);
      }
    };

    const fetchSessions = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/sessions/', {
          access_token: localStorage.getItem('access_token'), 
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            access_token: localStorage.getItem('access_token'),
          }
        })
        console.log(response.data.data)
        sessions.value = response.data.data; // Assuming the response contains an array of sessions
        console.log(sessions)
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    const goToSession = (uuid) => {
      router.push({ path: `/next-page/${uuid}` }); // Replace '/next-page' with your actual route
    };

    onMounted(() => {
      fetchSessions(); // Fetch sessions when the component is mounted
    });

    return {
      modal,
      name,
      sessions,
      openModal,
      closeModal,
      createSession,
      goToSession,
    };
  },
};
</script>

<style scoped>
.home-container {
  /* background: linear-gradient(to right, #6a11cb, #2575fc); */
  padding-top: 1em;
}

.previous-sessions {
  margin-bottom: 20px; /* Space between sessions and the button */
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


