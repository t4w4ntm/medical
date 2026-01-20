<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

interface ScoreDetail {
  id: number
  choiceId: string
  choiceText: string
  isCorrect: boolean
  wasClicked: boolean
  attemptNo: number
}

interface Score {
  id: number
  name: string
  time: number
  timeScore: number
  questionScore: number
  totalScore: number
  details?: ScoreDetail[] // Optional because it might not be loaded in list view unless we fetch it
}

const scores = ref<Score[]>([])
const loading = ref(true)
const searchTerm = ref('')

// Modal
const showModal = ref(false)
const selectedPlayer = ref<Score | null>(null)
const loadingDetails = ref(false)

// Format time
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const fetchScores = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/score`)
    const data = await res.json()
    // Sort by Total Score DESC
    scores.value = data.sort((a: Score, b: Score) => b.totalScore - a.totalScore)
    loading.value = false
  } catch (error) {
    console.error('Error fetching scores:', error)
    loading.value = false
  }
}

const fetchPlayerDetails = async (id: number) => {
  loadingDetails.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/score/${id}`)
    const data = await res.json()
    selectedPlayer.value = data
  } catch (error) {
    console.error('Error fetching details:', error)
  } finally {
    loadingDetails.value = false
  }
}

const openModal = async (player: Score) => {
  showModal.value = true
  // Check if details are already loaded (if API returns them in list, good, but likely we need to fetch individually for full details if list is light)
  // For now, based on my previous backend `findAll`, it returns basic info. `findOne` returns details.
  // So I should fetch details here.
  await fetchPlayerDetails(player.id)
}

const closeModal = () => {
  showModal.value = false
  selectedPlayer.value = null
}

const filteredScores = computed(() => {
  return scores.value.filter(s => 
    s.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

onMounted(() => {
  fetchScores()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 p-6 md:p-10">
    <div class="max-w-7xl mx-auto">
      <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Game Scoreboard</h1>
          <p class="text-slate-500 text-sm mt-1">Full detailed history of all game sessions</p>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="relative">
            <input 
              v-model="searchTerm"
              type="text" 
              placeholder="Search player..." 
              class="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-64"
            />
            <svg class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
          
          <button @click="fetchScores" class="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-slate-600 transition-colors" title="Refresh">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        </div>
      </header>

      <!-- Table Section -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200">
                <th class="p-4 w-20 text-center">Rank</th>
                <th class="p-4">Player Name</th>
                <th class="p-4 text-center">Play Time</th>
                <th class="p-4 text-center">Time Score</th>
                <th class="p-4 text-center">Question Score</th>
                <th class="p-4 text-right">Total Score</th>
                <th class="p-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="(player, index) in filteredScores" 
                :key="player.id"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="p-4 text-center font-mono font-bold text-slate-400">
                  <span v-if="index === 0" class="text-2xl">🥇</span>
                  <span v-else-if="index === 1" class="text-2xl">🥈</span>
                  <span v-else-if="index === 2" class="text-2xl">🥉</span>
                  <span v-else>#{{ index + 1 }}</span>
                </td>
                <td class="p-4 font-bold text-slate-700 text-lg group-hover:text-blue-700 transition-colors">
                  {{ player.name }}
                </td>
                <td class="p-4 text-center font-mono text-slate-600">
                  {{ formatTime(player.time) }}
                </td>
                <td class="p-4 text-center text-slate-600">
                  {{ player.timeScore.toLocaleString() }}
                </td>
                <td class="p-4 text-center text-slate-600">
                  {{ player.questionScore.toLocaleString() }}
                </td>
                <td class="p-4 text-right font-bold font-mono text-blue-600 text-lg">
                  {{ player.totalScore.toLocaleString() }}
                </td>
                <td class="p-4 text-center">
                  <button 
                    @click="openModal(player)"
                    class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
              
              <tr v-if="loading">
                <td colspan="7" class="p-8 text-center text-slate-400">Loading scores...</td>
              </tr>
              
              <tr v-if="!loading && filteredScores.length === 0">
                <td colspan="7" class="p-8 text-center text-slate-400">No players found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal for Details -->
    <Transition name="fade">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeModal"></div>
        
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 class="text-xl font-bold text-slate-800">Session Details</h2>
              <p class="text-slate-500 text-sm" v-if="selectedPlayer">Player: <span class="font-bold text-blue-600">{{ selectedPlayer.name }}</span> (ID: {{selectedPlayer.id}})</p>
            </div>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <!-- Content -->
          <div class="p-6 overflow-y-auto flex-1 bg-white">
            <div v-if="loadingDetails" class="text-center py-10 text-slate-400">
              Loading details...
            </div>
            
            <div v-else-if="selectedPlayer && selectedPlayer.details && selectedPlayer.details.length > 0">
              <h3 class="text-sm font-bold uppercase text-slate-400 tracking-wider mb-4">Question Analysis</h3>
              
              <div class="grid gap-4">
                <div 
                  v-for="(detail, i) in selectedPlayer.details" 
                  :key="detail.id"
                  class="border rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-slate-50"
                  :class="detail.isCorrect ? 'border-blue-200 bg-blue-50/10' : 'border-red-200 bg-red-50/10'"
                >
                  <!-- Status Icon -->
                  <div class="mt-1">
                    <div v-if="detail.isCorrect" class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div v-else class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                  </div>
                  
                  <!-- Info -->
                  <div class="flex-1">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                       <span class="font-mono text-xs text-slate-400">ID: {{ detail.choiceId }}</span>
                       <span 
                         class="text-xs font-bold px-2 py-0.5 rounded uppercase"
                         :class="detail.isCorrect ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'"
                       >
                         {{ detail.isCorrect ? 'Correct' : 'Incorrect' }}
                       </span>
                    </div>
                    
                    <p class="font-medium text-slate-800 text-lg mb-1">{{ detail.choiceText }}</p>
                    
                    <div class="flex items-center gap-4 text-sm text-slate-500 mt-2">
                       <span class="flex items-center gap-1">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                         Clicked: {{ detail.wasClicked ? 'Yes' : 'No' }}
                       </span>
                       <span class="flex items-center gap-1" v-if="detail.attemptNo > 0">
                         <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                         Attempt: {{ detail.attemptNo }}
                       </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else class="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
               No detailed question data available for this session.
            </div>
          </div>
          
          <div class="bg-slate-50 p-4 border-t border-slate-100 text-right">
            <button 
              @click="closeModal" 
              class="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
