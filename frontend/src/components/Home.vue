<template>
  <v-container fluid class="home-container">



    <v-row no-gutters class="justify-center align-center" style="height: 100px;">

<v-col class="d-flex flex-column align-center">


<v-btn @click="openModal">Start Session</v-btn>
</v-col>
</v-row>


    <v-row  v-if="sessions" no-gutters class="justify-center align-center">
        <v-col cols="12">
          <v-card class="mx-auto" style="padding: 2%;" >
            <div class="previous-sessions">
          
              <h3 style="padding: 1%;">Previous Sessions</h3>

          <v-table height="300px" style="border-radius: 1em; background-color: white; color: black;">
    <thead>
      <tr>
        <th class="text-left">
          Name
        </th>
        <th class="text-left">
          Action
        </th>
        <th class="text-left">
          Delete
        </th>
      </tr>
    </thead>

    
    <tbody>
      <tr v-for="session in sessions" :key="session.uuid">
        <td>{{ session.name }}</td>
        <td>
          <v-btn @click="goToSession(session.uuid)"> Go to Session</v-btn>
        
        </td>
        <td>
          <v-btn color="red" @click="deleteSession(session._id)">Delete</v-btn>
        </td>
      </tr>

    </tbody>
  </v-table>

  
        </div>
          </v-card>
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
    const router = useRouter();
    const modal = ref(false); 
    const name = ref(''); 
    const sessions = ref([]);

  
    const openModal = () => {
      modal.value = true; 
    };

    const closeModal = () => {
      modal.value = false;
      name.value = ''; 
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

        router.push({ path: `/board/${uuid}` }); 

        closeModal(); 
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
        sessions.value = response.data.data; 
      } catch (error) {
        console.error('Error fetching sessions:', error);
      }
    };

    const goToSession = (uuid) => {
      router.push({ path: `/board/${uuid}` }); 
    };

    const deleteSession = async (uuid) => {
      try {
        console.log(uuid, 'uuid ')
        const response = await axios.post('http://localhost:4000/api/v1/user/deleteSessions/', {
          uuid: uuid
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            access_token: localStorage.getItem('access_token'),
          }
        });
        console.log(response)
        console.log("HERE IN DELETED SESSIOns")
        console.log(sessions, 'asds')
        sessions.value = sessions.value.filter(session => session._id !== uuid);

        console.log('Session deleted successfully');
        
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    };

    onMounted(() => {
      fetchSessions(); 
    });

    return {
      modal,
      name,
      sessions,
      openModal,
      closeModal,
      createSession,
      goToSession,
      deleteSession,
    };
  },
};
</script>

<style scoped>
.home-container {
  padding-top: 1em;
}

.previous-sessions {
  margin-bottom: 20px; 
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


