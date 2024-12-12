<template>
    <v-container width="1000">
      <v-row no-gutters class=" justify-center">
        <v-col cols="12" md="6" class=" justify-center">
          <v-card class="pa-4">
            <v-card-title>Profile, </v-card-title>
   
            <v-form>
          <v-text-field
            label="Full Name"
            v-model="full_name"
            type="text"
            required
          ></v-text-field>
          <v-text-field
            label="Username"
            v-model="username"
            type="text"
            required
            disabled
          ></v-text-field>
          <v-text-field
            label="Email"
            v-model="email"
            type="email"
            required
          ></v-text-field>
          <v-text-field
            label="Location"
            v-model="location"
            type="text"
            required
          ></v-text-field>
          <v-text-field
            label="Password"
            v-model="password"
            type="password"
            required
          ></v-text-field>

          <v-text-field
            label="Confirm Password"
            v-model="confirm_password"
            type="password"
            required
          ></v-text-field>
          
         
          <v-card-actions>
            <!-- <div v-if="btn" > -->
            <v-btn :disabled="!passwordsMatch"  style="background-color: black; color: white;" @click="updateProfile">
              Update Profile
            </v-btn>
          <!-- </div> -->

          <!-- <div v-else >
            <v-btn v-model="btn" style="background-color: black; color: white;" @click="updateProfile">
              Update Profile
            </v-btn>
          </div> -->


          </v-card-actions>
      

        </v-form>
          </v-card>
        </v-col>
  

      </v-row>
  
      <v-row no-gutters class=" justify-center pt-10">
     
        <!-- Card to disply journal entries -->
        <v-col cols="12" md="6" class=" justify-center">
       
        </v-col>

              <!-- Snackbar for success message -->
      <v-snackbar
        v-model="showSnackbar"
        :timeout="snackbarTimeout"
        top
        right
      >
        {{ successMessage }}
      </v-snackbar>
      </v-row>
    </v-container>
  </template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth' // Import the Pinia store
const access_token = computed(() => localStorage.getItem('access_token'))

const username = ref('')
const password = ref('')
const confirm_password = ref('')
const full_name = ref('')
const location = ref('')
const email = ref('')
const user_id = ref('')
const btn = ref(true)
const router = useRouter()
const authStore = useAuthStore() // Use the Pinia store

const showSnackbar = ref(false)
const successMessage = ref('')
const snackbarTimeout = 3000 // Snackbar will be visible for 3 seconds


const homeAPI = async () => {
  const response = await authStore.homeAPI(access_token.value)
  if (response.data) {
    username.value = response.data.username
    email.value = response.data.data.email
    location.value = response.data.data.location
    full_name.value = response.data.data.full_name
    user_id.value = response.data.data._id

    return true
  }
}

homeAPI()


const passwordsMatch = computed(() => {
   if (password.value != '' && confirm_password.value !='') {
    return true
   }
})


const updateProfile = async () => {
    if (password.value != confirm_password.value){
        showSnackbar.value = true
        successMessage.value = "Password and Confirm Password Doesn't Match"
        return false
    }

    const response = await authStore.updateProfile(user_id.value, full_name.value,password.value,email.value,location.value,access_token.value)
    if (response)
    
         showSnackbar.value = true
        successMessage.value = "Profile Updated"
        homeAPI()
        return true
        
    {

    }
}





</script>