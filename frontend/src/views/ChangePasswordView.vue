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
                <input v-model="newPassword" type="password" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="••••••••" required />
            </div>

            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input v-model="confirmPassword" type="password" class="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="••••••••" required />
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
