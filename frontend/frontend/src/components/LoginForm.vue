<template>
  <v-container class="login-container">
    <v-row no-gutters class="justify-center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="login-card" elevation="3">
          <v-card-title class="text-center text-h4 font-weight-bold mb-6">
            Welcome Back
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="login">
              <v-text-field
                v-model="username"
                label="Username"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                :rules="[v => !!v || 'Username is required']"
                required
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                :type="showPassword ? 'text' : 'password'"
                :rules="[v => !!v || 'Password is required']"
                required
                @click:append-inner="showPassword = !showPassword"
              ></v-text-field>

              <v-btn
                block
                size="large"
                color="primary"
                :loading="loading"
                :disabled="!isFormValid"
                class="mt-6 mb-4"
                @click="login"
              >
                Sign In
              </v-btn>
            </v-form>
          </v-card-text>

          <v-card-text class="text-center">
            <router-link to="/signup" class="text-decoration-none">
              Don't have an account? <span class="font-weight-bold primary--text">Sign up</span>
            </router-link>
          </v-card-text>
        </v-card>

        <v-snackbar
          v-model="showSnackbar"
          :timeout="snackbarTimeout"
          :color="snackbarColor"
          location="top"
        >
          {{ successMessage }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const router = useRouter()
const authStore = useAuthStore()
const showSnackbar = ref(false)
const successMessage = ref('')
const snackbarColor = ref('error')
const snackbarTimeout = 3000

const isFormValid = computed(() => {
  return username.value.length > 0 && password.value.length > 0
})

const login = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  try {
    const success = await authStore.login(username.value, password.value)
    if (success) {
      snackbarColor.value = 'success'
      successMessage.value = 'Login successful!'
      showSnackbar.value = true
      router.push('/homepage')
    } else {
      snackbarColor.value = 'error'
      successMessage.value = 'Login failed. Please check your credentials and try again.'
      showSnackbar.value = true
    }
  } catch (error) {
    snackbarColor.value = 'error'
    successMessage.value = 'An error occurred. Please try again.'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
}

.login-card {
  padding: 2rem;
  border-radius: 16px;
}

:deep(.v-field) {
  border-radius: 8px;
}

:deep(.v-btn) {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
  height: 48px;
}
</style>