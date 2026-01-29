<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const isActive = (path: string) => route.path === path

const menuItems = [
  { name: 'Dashboard', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { name: 'Scoreboard', path: '/table', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z' }, 
  { name: 'Manage User', path: '/admin-manage', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' }
]

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <aside class="w-64 bg-[#11315B] text-white flex flex-col h-screen fixed left-0 top-0 z-50 font-sans shadow-xl">
    <!-- Logo Area -->
    <div class="h-24 flex items-center justify-center">
      <h1 class="text-2xl font-black tracking-widest uppercase">LOGO</h1>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-4 space-y-2 py-4">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path"
        class="flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
        :class="isActive(item.path) ? 'bg-[#1a4070] text-white font-bold shadow-md' : 'hover:bg-[#1a4070]/50 text-slate-300 hover:text-white'"
      >
        <!-- Active indicator strip -->
        <div v-if="isActive(item.path)" class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-lg"></div>

        <svg class="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
        </svg>
        <span class="text-sm tracking-wide">{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Admin Profile Section -->
    <div class="px-6 py-4">
       <div class="flex items-center gap-3 p-3 rounded-xl bg-[#0d2647] border border-[#1a4070]">
          <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[#11315B] font-bold">
            A
          </div>
          <div class="flex-1 min-w-0">
             <p class="text-sm font-bold text-white truncate">Admin</p>
             <p class="text-xs text-slate-400">admin@system</p>
          </div>
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
       </div>
    </div>

    <!-- Logout -->
    <div class="p-4 border-t border-[#1a4070]">
      <button 
        @click="handleLogout"
        class="flex items-center gap-4 px-4 py-3 w-full text-left bg-transparent hover:bg-red-500/10 text-slate-300 hover:text-red-300 rounded-lg transition-colors group"
      >
        <svg class="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
        </svg>
        <span class="font-bold text-sm">Logout</span>
      </button>
    </div>
  </aside>
</template>
