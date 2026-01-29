<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'

const router = useRouter()
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const errorMsg = ref('')
const successMsg = ref('')
const loading = ref(false)

const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const handleChangePassword = async () => {
    errorMsg.value = ''
    successMsg.value = ''

    if (newPassword.value !== confirmPassword.value) {
        errorMsg.value = 'New passwords do not match'
        return
    }

    if (newPassword.value.length < 6) {
        errorMsg.value = 'Password must be at least 6 characters'
        return
    }

    loading.value = true
    try {
        const userStr = localStorage.getItem('user')
        if (!userStr) {
            router.push('/login')
            return
        }
        const user = JSON.parse(userStr)
        const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
        
        // Note: Real world scenario should verify old password first.
        // For this MVP, as per request, we just update it.
        // Assuming user ID is available in local storage user object.
        
        const res = await fetch(`${apiUrl}/admin/${user.id}/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                password: newPassword.value
            })
        })

        if (res.ok) {
            successMsg.value = 'Password changed successfully'
            newPassword.value = ''
            confirmPassword.value = ''
            currentPassword.value = ''
        } else {
            errorMsg.value = 'Failed to change password'
        }
    } catch (error) {
        console.error(error)
        errorMsg.value = 'An error occurred'
    } finally {
        loading.value = false
    }
}
</script>

<template>
  <DashboardLayout>
    <div class="max-w-xl mx-auto mt-10">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <h2 class="text-2xl font-black text-slate-800 mb-6">Change Password</h2>
        
        <form @submit.prevent="handleChangePassword" class="space-y-6">
            <!-- Current Password (Optional for now based on backend, but good for UI) -->
            <!-- <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Current Password</label>
                <input v-model="currentPassword" type="password" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" required />
            </div> -->

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">New Password</label>
                <div class="relative">
                    <input 
                        v-model="newPassword" 
                        :type="showNewPassword ? 'text' : 'password'" 
                        class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans pr-10" 
                        placeholder="••••••••" 
                        required 
                    />
                    <button 
                        type="button" 
                        @click="showNewPassword = !showNewPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                        <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                </div>
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <div class="relative">
                    <input 
                        v-model="confirmPassword" 
                        :type="showConfirmPassword ? 'text' : 'password'" 
                        class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans pr-10" 
                        placeholder="••••••••" 
                        required 
                    />
                    <button 
                        type="button" 
                        @click="showConfirmPassword = !showConfirmPassword"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                         <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                         <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                </div>
            </div>

            <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                {{ errorMsg }}
            </div>
            
            <div v-if="successMsg" class="p-3 bg-green-50 text-green-600 text-sm rounded-lg font-medium">
                {{ successMsg }}
            </div>

            <button 
                type="submit" 
                :disabled="loading"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
            >
                {{ loading ? 'Saving...' : 'Change Password' }}
            </button>
        </form>
      </div>
    </div>
  </DashboardLayout>
</template>
