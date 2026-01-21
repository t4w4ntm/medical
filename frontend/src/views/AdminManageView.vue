<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface AdminUser {
  id: number
  username: string
}

const router = useRouter()
const admins = ref<AdminUser[]>([])
const loading = ref(true)
const showCreateModal = ref(false)

// Form data
const newUsername = ref('')
const newPassword = ref('')
const showPassword = ref(false)
const creating = ref(false)
const errorMsg = ref('')

const fetchAdmins = async () => {
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/admin`)
    if (res.ok) {
        admins.value = await res.json()
    }
  } catch (error) {
    console.error('Error fetching admins:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateAdmin = async () => {
    if(!newUsername.value || !newPassword.value) {
        errorMsg.value = 'Please fill in all fields'
        return
    }

    creating.value = true
    errorMsg.value = ''

    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
        const res = await fetch(`${apiUrl}/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: newUsername.value,
                password: newPassword.value
            })
        })

        if (!res.ok) {
            throw new Error('Failed to create admin')
        }

        // Success
        await fetchAdmins()
        closeModal()
        newUsername.value = ''
        newPassword.value = ''
    } catch (err) {
        errorMsg.value = 'Failed to create user. Username might be taken.'
    } finally {
        creating.value = false
    }
}

const closeModal = () => {
    showCreateModal.value = false
    errorMsg.value = ''
}

const goBack = () => {
    router.push('/table')
}

onMounted(() => {
  fetchAdmins()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
           <button @click="goBack" class="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-2 transition-colors">
             <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
             Back to Score Table
           </button>
           <h1 class="text-3xl font-black text-slate-800 tracking-tight">Admin Management</h1>
           <p class="text-slate-500 text-sm mt-1">Manage system administrators</p>
        </div>
        <button 
          @click="showCreateModal = true"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add New Admin
        </button>
      </div>

      <!-- List -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div v-if="loading" class="p-10 text-center text-slate-400">Loading...</div>
         
         <div v-else-if="admins.length === 0" class="p-10 text-center text-slate-400">No admins found.</div>

         <div v-else class="divide-y divide-slate-100">
            <div v-for="admin in admins" :key="admin.id" class="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg">
                        {{ admin.username.charAt(0).toUpperCase() }}
                    </div>
                    <div>
                        <h3 class="font-bold text-slate-800 text-lg">{{ admin.username }}</h3>
                        <p class="text-xs text-slate-400 font-mono">ID: {{ admin.id }}</p>
                    </div>
                </div>
                <!-- Future: Add Delete Button -->
            </div>
         </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transform transition-all">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">Create New Admin</h2>
            
            <form @submit.prevent="handleCreateAdmin" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Username</label>
                    <input v-model="newUsername" type="text" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" placeholder="Ex. user2" required />
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <div class="relative">
                        <input v-model="newPassword" :type="showPassword ? 'text' : 'password'" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium pr-10" placeholder="••••••••" required />
                        <button 
                            type="button" 
                            @click="showPassword = !showPassword"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                    </div>
                </div>

                <div v-if="errorMsg" class="text-red-500 text-sm bg-red-50 p-2 rounded text-center">{{ errorMsg }}</div>

                <div class="flex gap-3 mt-6">
                    <button type="button" @click="closeModal" class="flex-1 py-3 text-slate-500 hover:text-slate-700 font-bold transition-colors">Cancel</button>
                    <button type="submit" :disabled="creating" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                        {{ creating ? 'Creating...' : 'Create Admin' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
  </div>
</template>
