<script setup lang="ts">
import Sidebar from '../components/Sidebar.vue'
</script>

<template>
  <div class="flex min-h-screen bg-slate-50">
    <!-- Fixed Sidebar -->
    <Sidebar />

    <!-- Main Content Area -->
    <div class="flex-1 ml-64 transition-all duration-300">
      <main class="p-8">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
