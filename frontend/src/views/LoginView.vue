<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMsg.value = ''
  loading.value = true
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    if (!res.ok) {
      throw new Error('Login failed')
    }

    const data = await res.json()
    // Save token or login state (simple for now)
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify(data.user))
    
    router.push('/table') // Go to table page after login
  } catch (err) {
    errorMsg.value = 'Invalid username or password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-slate-50 p-4">
    <div class="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm border border-slate-100">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Login</h1>
        <p class="text-slate-500 text-sm mt-2">Enter your credentials to access the dashboard</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Username</label>
          <input 
            v-model="username"
            type="text" 
            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
            placeholder="admin"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-1">Password</label>
          <input 
            v-model="password"
            type="password" 
            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium text-slate-800"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="errorMsg" class="text-red-500 text-sm text-center font-bold bg-red-50 p-2 rounded-lg">
          {{ errorMsg }}
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/30 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading">Logging in...</span>
          <span v-else>Login to Dashboard</span>
        </button>
      </form>
    </div>
  </div>
</template>
