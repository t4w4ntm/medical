<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardLayout from '../layouts/DashboardLayout.vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Line, Doughnut } from 'vue-chartjs'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

// Data and State
const loading = ref(true)
const errorMessage = ref('')
const stats = ref<{
    overview: { totalParticipants: number, avgTime: number, avgQuestionScore: number },
    performance: { excellent: number, average: number, needImprove: number },
    trend: { date: string, avgScore: string }[],
    questionAnalysis: { scenario: string, question: string, correct: string, wrong: string }[]
} | null>(null)

// Chart Data Configs
const trendChartData = ref({
    labels: [] as string[],
    datasets: [
        {
            label: 'Average Score',
            backgroundColor: '#3B82F6',
            borderColor: '#3B82F6',
            data: [] as number[],
            tension: 0.4
        }
    ]
})

const performanceChartData = ref({
    labels: ['Excellent (>800)', 'Average (500-800)', 'Need Improve (<500)'],
    datasets: [
        {
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            data: [0, 0, 0]
        }
    ]
})

const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: { beginAtZero: true }
    }
}

const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' as const }
    }
}

// Formatters
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
}

// Fetch Data
const fetchDashboardStats = async () => {
    loading.value = true
    errorMessage.value = ''
    try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
        console.log('Fetching stats from:', apiUrl) // Debug log
        
        const res = await fetch(`${apiUrl}/score/dashboard/stats`)
        if (res.ok) {
            const data = await res.json()
            stats.value = data
            // ... chart updates ...
             if (data.trend) {
                trendChartData.value = {
                    labels: data.trend.map((t: any) => t.date),
                    datasets: [{
                        label: 'Average Score',
                        backgroundColor: '#3B82F6',
                        borderColor: '#3B82F6',
                        data: data.trend.map((t: any) => parseFloat(t.avgScore)),
                        tension: 0.4
                    }]
                }
            }

            if (data.performance) {
                performanceChartData.value = {
                    labels: ['Excellent (>800)', 'Average (500-800)', 'Need Improve (<500)'],
                    datasets: [{
                        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
                        data: [
                            data.performance.excellent, 
                            data.performance.average, 
                            data.performance.needImprove
                        ]
                    }]
                }
            }
        } else {
            errorMessage.value = `Failed to load data. Status: ${res.status} ${res.statusText} from ${apiUrl}`
            console.error(errorMessage.value)
        }
    } catch (error: any) {
        errorMessage.value = `Error connecting to server: ${error.message}`
        console.error("Failed to fetch dashboard stats", error)
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchDashboardStats()
})
</script>

<template>
  <DashboardLayout>
    <div class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-black text-slate-800 tracking-tight">Overview Dashboard</h1>
      </header>

      <div v-if="loading" class="text-center py-20 text-slate-400">Loading dashboard...</div>
      
      <div v-else-if="errorMessage" class="text-center py-20">
          <div class="text-red-500 font-bold mb-2">Failed to load data</div>
          <p class="text-slate-500 text-sm">{{ errorMessage }}</p>
          <p class="text-slate-400 text-xs mt-4">
            If you are running backend locally, make sure VITE_API_URL is set to http://localhost:3000
          </p>
      </div>

      <div v-else>
          <!-- Stat Cards Grid -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p class="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Participant</p>
              <div class="flex items-center gap-2">
                  <div class="text-slate-800">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 class="text-4xl font-black text-slate-800">{{ stats?.overview.totalParticipants }}</h3>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p class="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Avg. Time Used</p>
               <div class="flex items-center gap-2">
                  <div class="text-slate-800">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <h3 class="text-4xl font-black text-slate-800">{{ formatTime(stats?.overview.avgTime || 0) }}</h3>
              </div>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
              <p class="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Avg. Question Score</p>
               <div class="flex items-center gap-2">
                  <div class="text-slate-800">
                     <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 class="text-4xl font-black text-slate-800">{{ stats?.overview.avgQuestionScore }}</h3>
              </div>
            </div>
          </div>

          <!-- Charts Section -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <!-- Score Trend -->
              <div class="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 class="text-lg font-bold text-slate-800 mb-6">Average Score Trend</h3>
                  <div class="h-64">
                      <Line :data="trendChartData" :options="trendChartOptions" />
                  </div>
              </div>

               <!-- Performance Levels -->
              <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 class="text-lg font-bold text-slate-800 mb-6">Performance Levels</h3>
                  <div class="h-64 flex justify-center">
                      <Doughnut :data="performanceChartData" :options="performanceChartOptions" />
                  </div>
                  <div class="mt-4 space-y-2">
                       <div class="flex justify-between text-xs">
                           <span class="flex items-center gap-2 font-medium text-slate-600"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Excellent (>800)</span>
                           <span class="font-bold text-slate-800">{{ stats?.performance.excellent }} คน</span>
                       </div>
                       <div class="flex justify-between text-xs">
                           <span class="flex items-center gap-2 font-medium text-slate-600"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Average (500-800)</span>
                           <span class="font-bold text-slate-800">{{ stats?.performance.average }} คน</span>
                       </div>
                       <div class="flex justify-between text-xs">
                           <span class="flex items-center gap-2 font-medium text-slate-600"><span class="w-2 h-2 rounded-full bg-red-500"></span> Need Improve (<500)</span>
                           <span class="font-bold text-slate-800">{{ stats?.performance.needImprove }} คน</span>
                       </div>
                  </div>
              </div>
          </div>

          <!-- Question Analysis Table -->
          <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <div class="p-6 border-b border-slate-100">
                 <h3 class="text-lg font-bold text-slate-800">Question Performance Analysis</h3>
             </div>
             <div class="overflow-x-auto">
                 <table class="w-full text-left">
                     <thead class="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                         <tr>
                             <th class="p-4 w-12 text-center">#</th>
                             <th class="p-4">Question Detail</th>
                             <th class="p-4">Scenario</th>
                             <th class="p-4 text-right">Correct/Wrong</th>
                         </tr>
                     </thead>
                     <tbody class="divide-y divide-slate-100 text-sm">
                         <tr v-for="(q, i) in stats?.questionAnalysis" :key="i" class="hover:bg-slate-50 transition-colors">
                             <td class="p-4 text-center text-slate-400 font-mono">{{ i + 1 }}</td>
                             <td class="p-4 font-bold text-slate-700">{{ q.question }}</td>
                             <td class="p-4 text-slate-500">{{ q.scenario }}</td>
                             <td class="p-4 text-right font-mono font-bold">
                                 <span class="text-emerald-500">{{ q.correct }}</span>
                                 <span class="text-slate-300 mx-1">/</span>
                                 <span class="text-red-500">{{ q.wrong }}</span>
                             </td>
                         </tr>
                         <tr v-if="!stats?.questionAnalysis?.length">
                             <td colspan="4" class="p-8 text-center text-slate-400">No question data analysis available.</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
          </div>
      </div>
    </div>
  </DashboardLayout>
</template>
