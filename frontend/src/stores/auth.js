// stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    access_token: null,
    refresh_token: null,
    username: null,
    full_name: null,
    location: null,
    email: null,
    user: null,
  }),
  actions: {
    async add(text, access_token){
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/home/add/', {
          text,
          access_token,

        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            'access_token': access_token
          }
        })
        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async list(access_token){
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/home/list/', {
          access_token,

        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            'access_token': access_token
          }
        })
        return response
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async delete (id, access_token){
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/home/delete/', {
          id,

        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            'access_token': access_token
          }
        })
        return response

      }
      catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async login(username, password) {
      try {
        const response = await axios.post('http://localhost:4000/api/v1/user/login/', {
          username,
          password
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
          }
        })

        console.log(response, 'response')



        // Home API 
        const get_home_api = await axios.post('http://localhost:4000/api/v1/user/home/', {
          access_token:response.data.access_token,
        }, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-type': 'application/json',
            access_token:response.data.access_token,
          }
        })

     
        // Set user data
        this.access_token = response.data.access_token
        this.refresh_token = response.data.refresh_token
        this.username = username
        this.full_name = get_home_api.data.data.full_name
        this.location = get_home_api.data.data.location
        this.email = get_home_api.data.data.email
        this.user = this.username

        // Store tokens and user data in localStorage
        localStorage.setItem('refresh_token', this.refresh_token)
        localStorage.setItem('access_token', this.access_token)
        localStorage.setItem('username', this.username)
        localStorage.setItem('full_name', this.full_name)
        localStorage.setItem('location', this.location)
        localStorage.setItem('email', this.email)

        // const home_api 

        return true
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    },

    async logout(access_token) {

      console.log(access_token)
      try {

        console.log("IN AUTH LOGOUT ", access_token)
        const response =  await axios({
          method: 'POST',
          url: 'http://localhost:4000/api/v1/user/logout/',
          headers: {
         'Access-Control-Allow-Origin': '*',
         'Content-type': 'application/json',
         'access_token': access_token,
      }
  
        })

        if (response.status == 200) { 

    return true
  
        }

      } catch{

      }
    },

    async signup(userData) {
        try {
          const response = await axios.post('http://localhost:4000/api/v1/user/signup/', userData, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-type': 'application/json',
            }
          })
  
          if (response.status === 201) {
            this.access_token = response.data.access_token
            this.username = userData.username
            this.full_name = userData.full_name
            this.location = userData.location
            this.email = userData.email
            
            return { success: true, message: `Welcome, ${this.username}!` }
          } else if (response.status === 400) {
            return { success: false, message: 'Username already exists' }
          }
        } catch (error) {
          console.error('Signup failed:', error)
          return { success: false, message: 'Signup failed. Please try again.' }
        }
      },
      async homeAPI(access_token){
        try {
    
          const get_home_api = await axios.post('http://localhost:4000/api/v1/user/home/', {
            access_token:access_token,
          }, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-type': 'application/json',
              access_token:access_token,
            }
          })

          
          if (get_home_api )
          {
            return get_home_api
          }
    
        
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    
      },
      async updateProfile(user_id, full_name,password,email,location, access_token){
        try {
    
          const update_profile = await axios.post('http://localhost:4000/api/v1/user/home/update_profile/', {
            user_id, full_name,password,email,location,
          }, {
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Content-type': 'application/json',
              access_token:access_token,
            }
          })

          
          if (update_profile )
          {
            return update_profile
          }
    
        
      } catch (error) {
        console.error('Login failed:', error)
        return false
      }
    
      }
  },

 
})