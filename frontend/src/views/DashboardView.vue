<script setup lang="ts">
import DashboardLayout from '../layouts/DashboardLayout.vue'
</script>

<template>
  <DashboardLayout>
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p class="text-slate-500 text-sm mt-1">Summary of game performance and statistics</p>
      </header>

      <!-- Stat Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Total Players -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Players</p>
            <h3 class="text-2xl font-black text-slate-800">423</h3>
          </div>
        </div>

        <!-- Avg Score -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Average Score</p>
            <h3 class="text-2xl font-black text-slate-800">1,250</h3>
          </div>
        </div>

        <!-- Completion Rate -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
           <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p class="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Play Time</p>
            <h3 class="text-2xl font-black text-slate-800">12:30</h3>
          </div>
        </div>
      </div>

      <!-- Placeholder Chart Section -->
      <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
         <h3 class="text-lg font-bold text-slate-800 mb-6">Activity Overview</h3>
         <div class="h-64 flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-100 rounded-xl">
            Chart Coming Soon...
         </div>
      </div>

    </div>
  </DashboardLayout>
</template>
