<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  collapsed: boolean
}>()

const emit = defineEmits(['toggle'])

const route = useRoute()
const router = useRouter()
const showProfileMenu = ref(false)
const currentUser = ref<any>(null)

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

const toggleProfileMenu = () => {
  showProfileMenu.value = !showProfileMenu.value
}

// Close menu when clicking outside
const closeMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target.closest('#profile-menu-container')) {
    showProfileMenu.value = false
  }
}

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
  document.addEventListener('click', closeMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeMenu)
})
</script>

<template>
  <aside 
    class="bg-[#11315B] text-white flex flex-col h-screen fixed left-0 top-0 z-50 font-sans shadow-xl transition-all duration-300"
    :class="collapsed ? 'w-20' : 'w-64'"
  >
    <!-- Logo Area -->
    <div class="h-24 flex items-center px-4 mt-4 mb-2 relative" :class="collapsed ? 'justify-center' : 'gap-4'">
      <div 
        class="bg-white rounded-full flex items-center justify-center shrink-0 shadow-lg transition-all duration-300"
        :class="collapsed ? 'w-10 h-10' : 'w-12 h-12'"
      >
        <img src="@/assets/Logo.png" alt="GoldMed Logo" class="object-contain" :class="collapsed ? 'w-8 h-8' : 'w-10 h-10'">
      </div>
      <h1 
        class="text-2xl font-black tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 origin-left"
        :class="collapsed ? 'w-0 opacity-0 scale-0' : 'w-auto opacity-100 scale-100'"
      >
        GoldMed
      </h1>
      
      <!-- Toggle Button (Hamburger) -->
      <button 
        @click="$emit('toggle')"
        class="absolute right-4 top-4 text-slate-300 hover:text-white p-1 rounded-md transition-colors z-50"
        :title="collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
      >
         <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex-1 px-3 space-y-2 py-4">
      <router-link 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path"
        class="flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden"
        :class="[
          isActive(item.path) ? 'bg-[#1a4070] text-white font-bold shadow-md' : 'hover:bg-[#1a4070]/50 text-slate-300 hover:text-white',
          collapsed ? 'justify-center' : ''
        ]"
        :title="collapsed ? item.name : ''"
      >
        <div v-if="isActive(item.path)" class="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-l-lg"></div>
        <svg class="w-6 h-6 transition-transform group-hover:scale-110 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="item.icon"></path>
        </svg>
        <span 
            class="text-sm tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300 origin-left"
            :class="collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'"
        >{{ item.name }}</span>
      </router-link>
    </nav>

    <!-- Admin Profile Section -->
    <div class="p-4 border-t border-[#1a4070]">
       <div id="profile-menu-container" class="relative">
         <button 
            @click="toggleProfileMenu"
            class="w-full flex items-center gap-3 p-2 rounded-xl bg-[#0d2647] border border-[#1a4070] hover:bg-[#1a4070] transition-colors text-left"
            :class="collapsed ? 'justify-center' : ''"
            :title="collapsed ? (currentUser?.username || 'Admin') : ''"
         >
            <div class="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-[#11315B] font-bold shrink-0">
              {{ currentUser?.username?.charAt(0).toUpperCase() || 'A' }}
            </div>
            <div v-if="!collapsed" class="flex-1 min-w-0">
               <p class="text-sm font-bold text-white truncate">{{ currentUser?.username || 'Admin' }}</p>
               <p class="text-xs text-slate-400 truncate">{{ currentUser?.username ? 'Administrator' : 'System' }}</p>
            </div>
            <svg v-if="!collapsed" class="w-4 h-4 text-slate-400 transition-transform duration-200" :class="{ 'rotate-180': showProfileMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
         </button>

         <!-- Dropdown Menu -->
         <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
         >
            <div v-if="showProfileMenu" class="absolute bottom-full mb-2 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden py-1 z-50 w-48" :class="collapsed ? 'left-full ml-2' : 'left-0 right-0'">
               <router-link to="/change-password" class="flex items-center gap-3 px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium">
                  <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                  Change Password
               </router-link>
               <button @click="handleLogout" class="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium text-left">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                  Logout
               </button>
            </div>
         </Transition>
       </div>
    </div>
  </aside>
</template>
