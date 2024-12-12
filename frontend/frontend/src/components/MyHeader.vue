<template>
  <v-app-bar app elevation="1" class="header">
    <div class="d-flex align-center">
      <router-link to="/homepage" class="text-decoration-none">
        <h2 class="brand-title">Live Drawing</h2>
      </router-link>
    </div>

    <v-spacer></v-spacer>

    <div v-if="access_token || isLoggedIn" class="nav-links">
      <v-btn 
        text 
        to="/homepage" 
        class="nav-btn"
        prepend-icon="mdi-home"
      >
        Home {{ total_entries || 5 }}
      </v-btn>
      <v-btn 
        text 
        to="/profile" 
        class="nav-btn"
        prepend-icon="mdi-account"
      >
        Profile
      </v-btn>
      <v-btn 
        class="nav-btn logout-btn"
        prepend-icon="mdi-logout"
        @click="logout"
      >
        Logout
      </v-btn>
    </div>
    <div v-else class="nav-links">
      <v-btn 
        text 
        to="/login" 
        class="nav-btn"
        prepend-icon="mdi-login"
      >
        Login
      </v-btn>
      <v-btn 
        text 
        to="/signup" 
        class="nav-btn"
        prepend-icon="mdi-account-plus"
      >
        Sign Up
      </v-btn>
    </div>

    <v-snackbar
      v-model="showSnackbar"
      :timeout="snackbarTimeout"
      location="top right"
      color="error"
    >
      {{ successMessage }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="showSnackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app-bar>
</template>

<script setup>
  import { ref, computed } from 'vue'
  import { useRouter } from 'vue-router'

// Computed user data from localStorage
const user = computed(() => localStorage.getItem('username'))
const full_name = computed(()=> localStorage.getItem('full_name'))
const access_token = computed(()=> localStorage.getItem('access_token'))
const router = useRouter()

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isLoggedIn = computed(() => authStore.user !== null)
const getAccessToken = computed( () => authStore.access_token)
console.log(getAccessToken, 'getAccessToken')
const showSnackbar = ref(false)
const successMessage = ref('')
const snackbarTimeout = 3000 // Snackbar will be visible for 3 seconds


const logout = async () => {
  console.log(access_token.value, 'access_token.value in header file')
  const success = await authStore.logout(access_token.value)

  if (success){
    router.path('/login')
  }
  else {
    showSnackbar.value = true
    successMessage.value = 'Logout failed. Please Reload the page and try again.'
  }

}
</script>

<style scoped>
.header {
  background: linear-gradient(to right, #2c3e50, #3498db);
  color: white;
  padding: 0 2rem;
}

.brand-title {
  color: white;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
  transition: opacity 0.3s ease;
}

.brand-title:hover {
  opacity: 0.8;
}

.nav-links {
  display: flex;
  gap: 1rem;
}

.nav-btn {
  font-weight: 500;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.logout-btn {
  background-color: rgba(255, 255, 255, 0.1);
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
}
</style>