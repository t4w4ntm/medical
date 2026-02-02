<script setup lang="ts">
import { ref } from 'vue'
import Sidebar from '../components/Sidebar.vue'

const isCollapsed = ref(false)

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Fixed Sidebar -->
    <Sidebar :collapsed="isCollapsed" @toggle="toggleSidebar" />

    <!-- Main Content Area -->
    <div 
      class="flex-1 transition-all duration-300"
      :class="isCollapsed ? 'ml-20' : 'ml-64'"
    >
      <main class="p-8">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
