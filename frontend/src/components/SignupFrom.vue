<template>
  <v-container fluid class="signup-container">
    <v-row no-gutters class="justify-center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6 rounded-lg elevation-8" color="#f9f9f9">
          <v-card-title class="text-h5 font-weight-bold text-center mb-4">
            Create Your Account
          </v-card-title>
          
          <v-card-text>
            <v-form @submit.prevent="signup" v-model="isFormValid">
              <v-text-field
                v-model="full_name"
                label="Full Name"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="username"
                label="Username"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-account-circle"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="email"
                label="Email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="location"
                label="Location"
                :rules="[rules.required]"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                density="comfortable"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Password"
                :rules="[rules.required, rules.password]"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                density="comfortable"
                :type="showPassword ? 'text' : 'password'"
                @click:append-inner="showPassword = !showPassword"
                class="mb-3"
              ></v-text-field>

              <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
                :rules="[rules.required, rules.passwordMatch]"
                variant="outlined"
                prepend-inner-icon="mdi-lock-check"
                :type="showPassword ? 'text' : 'password'"
                density="comfortable"
                class="mb-4"
              ></v-text-field>
            </v-form>
          </v-card-text>

          <v-card-actions class="flex-column">
            <v-btn
              :loading="loading"
              :disabled="!isFormValid"
              color="primary"
              size="large"
              block
              @click="signup"
              class="mb-2 rounded-lg"
            >
              Sign Up
            </v-btn>
            <div class="text-body-2 text-medium-emphasis" style="color: black;">
              <span style="color: black;">Already have an account?</span>
              <v-btn>
              <router-link to="/login" class="text-decoration-none" style="color: black;">Login</router-link>
            </v-btn>
            </div>
          </v-card-actions>
        </v-card>

        <v-snackbar
          v-model="showSnackbar"
          :color="snackbarColor"
          :timeout="snackbarTimeout"
          location="top"
          class="snackbar"
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
const full_name = ref('')
const location = ref('')
const email = ref('')
const router = useRouter()
const authStore = useAuthStore()

const confirmPassword = ref('')
const showPassword = ref(false)
const loading = ref(false)
const isFormValid = ref(false)
const snackbarColor = ref('success')

const showSnackbar = ref(false)
const successMessage = ref('')
const snackbarTimeout = 3000

const rules = {
  required: v => !!v || 'This field is required',
  email: v => /.+@.+\..+/.test(v) || 'Please enter a valid email',
  password: v => v.length >= 8 || 'Password must be at least 8 characters',
  passwordMatch: v => v === password.value || 'Passwords must match'
}

const passwordsMatch = computed(() => {
  return password.value === confirmPassword.value &&
         password.value !== '' &&
         username.value !== '' &&
         location.value !== '' &&
         email.value !== '' &&
         full_name.value !== ''
})

const signup = async () => {
  loading.value = true
  
  try {
    const userData = {
      username: username.value,
      password: password.value,
      full_name: full_name.value,
      location: location.value,
      email: email.value
    }

    const { success, message } = await authStore.signup(userData)
    
    successMessage.value = message
    snackbarColor.value = success ? 'success' : 'error'
    showSnackbar.value = true

    if (success) {
      setTimeout(() => {
        router.push('/login')
      }, snackbarTimeout)
    }
  } catch (error) {
    successMessage.value = 'An error occurred during signup'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.v-card {
  background-color: #f9f9f9;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.v-text-field {
  transition: border-color 0.3s;
}

.v-text-field:focus {
  border-color: #6a11cb;
}

.v-btn {
  text-transform: none;
  font-weight: 600;
  transition: background-color 0.3s, transform 0.2s;
}

.gradient-button {
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  color: white;
}

.gradient-button:hover {
  background: linear-gradient(90deg, #2575fc, #6a11cb);
  transform: scale(1.05);
}

.snackbar {
  border-radius: 8px;
  font-weight: bold;
}
</style>