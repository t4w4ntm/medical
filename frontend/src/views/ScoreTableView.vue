<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

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
  createdAt: string
  details?: ScoreDetail[] // Optional because it might not be loaded in list view unless we fetch it
}

const router = useRouter()
const currentUser = ref<any>(null)

const scores = ref<Score[]>([])
const loading = ref(true)

const searchTerm = ref('')

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10)
const totalItems = ref(0)

const handleLogout = () => {
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('user')
  router.push('/login')
}

// Sorting
type SortKey = 'createdAt' | 'name' | 'time' | 'timeScore' | 'questionScore' | 'totalScore'
const sortKey = ref<SortKey>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortBy = (key: SortKey) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc' // Default to desc for numbers usually
  }
}

// Format Date
const formatDate = (dateString: string): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleString('th-TH', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

// Modal
const showModal = ref(false)
const selectedPlayer = ref<Score | null>(null)
const loadingDetails = ref(false)

// Delete Modal
const showDeleteModal = ref(false)
const scoreToDelete = ref<Score | null>(null)
const deleting = ref(false)

// Delete Modal
const isDeleteMode = ref(false) // Toggle for delete mode
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const fetchScores = async (page = 1) => {
  loading.value = true
  // Reset sorting when fetching new page to avoid confusion, or handle sort + pagination backend side (ideal). 
  // For now, let's keep client side sort for the page.
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/score?page=${page}&limit=${limit.value}`)
    const data = await res.json()
    
    // Backend now returns { data: [], total: number, page: number, limit: number }
    if (data.data) {
        scores.value = data.data
        totalItems.value = data.total
        currentPage.value = page
        totalPages.value = Math.ceil(data.total / limit.value)
    } else {
        // Fallback if backend not updated yet
        scores.value = data
    }
    
    loading.value = false
  } catch (error) {
    console.error('Error fetching scores:', error)
    loading.value = false
  }
}

const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages.value) return
    fetchScores(newPage)
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

const confirmDelete = (score: Score) => {
  scoreToDelete.value = score
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  scoreToDelete.value = null
}

const deleteScore = async () => {
  if (!scoreToDelete.value) return
  
  deleting.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/score/${scoreToDelete.value.id}`, {
      method: 'DELETE'
    })
    
    if (res.ok) {
      // Remove locally
      scores.value = scores.value.filter(s => s.id !== scoreToDelete.value?.id)
      closeDeleteModal()
    } else {
      console.error('Failed to delete score')
    }
  } catch (error) {
    console.error('Error deleting score:', error)
  } finally {
    deleting.value = false
  }
}

const filteredScores = computed(() => {
  let result = scores.value.filter(s => 
    s.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
  
  return result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1
    
    if (sortKey.value === 'name') {
      return a.name.localeCompare(b.name) * modifier
    } else if (sortKey.value === 'createdAt') {
      return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * modifier
    } else {
      // Numbers
      return (a[sortKey.value] - b[sortKey.value]) * modifier
    }
  })
})

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
  fetchScores(1)
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
        
        <div class="flex flex-col items-end gap-3">
          <div class="flex items-center gap-2">
            <div class="relative">
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Search player..." 
                class="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-full md:w-64"
              />
              <svg class="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>

            <button @click="router.push('/admin-manage')" class="px-3 py-2 bg-slate-800 text-white rounded-lg shadow-sm font-bold text-sm hover:bg-slate-700 transition-colors flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Manage Users
            </button>
            
            <button @click="fetchScores(currentPage)" class="p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-slate-600 transition-colors" title="Refresh">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>

            <button 
              @click="isDeleteMode = !isDeleteMode" 
              class="p-2 border rounded-lg shadow-sm transition-colors"
              :class="isDeleteMode ? 'bg-red-100 text-red-600 border-red-200' : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200'"
              title="Toggle Delete Mode"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
            
            <button @click="handleLogout" class="p-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-sm text-red-600 transition-colors" title="Logout">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </div>

          <!-- Pagination Row -->
          <div class="flex items-center gap-2">
             <button 
                @click="changePage(currentPage - 1)" 
                :disabled="currentPage === 1"
                class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
             </button>
             <span class="text-xs font-bold text-slate-400 font-mono">{{ currentPage }} / {{ totalPages }}</span>
             <button 
                @click="changePage(currentPage + 1)" 
                :disabled="currentPage === totalPages"
                class="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors text-slate-600"
             >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
             </button>
          </div>
        </div>
      </header>

      <!-- Table Section -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold border-b border-slate-200 select-none">
                <th @click="sortBy('createdAt')" class="p-4 w-32 cursor-pointer hover:bg-slate-100 transition-colors group">
                  Date
                  <span v-if="sortKey === 'createdAt'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('name')" class="p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                  Player Name
                  <span v-if="sortKey === 'name'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('time')" class="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  Play Time
                  <span v-if="sortKey === 'time'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('timeScore')" class="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  Time Score
                  <span v-if="sortKey === 'timeScore'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('questionScore')" class="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors">
                  Question Score
                  <span v-if="sortKey === 'questionScore'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th @click="sortBy('totalScore')" class="p-4 text-right cursor-pointer hover:bg-slate-100 transition-colors">
                  Total Score
                  <span v-if="sortKey === 'totalScore'" class="ml-1 text-blue-500">{{ sortOrder === 'asc' ? '↑' : '↓' }}</span>
                </th>
                <th class="p-4 text-center w-24">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="(player, index) in filteredScores" 
                :key="player.id"
                class="hover:bg-slate-50 transition-colors group"
              >
                <td class="p-4 text-sm text-slate-500 font-mono">
                  {{ formatDate(player.createdAt) }}
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
                  <div class="flex justify-center">
                    <button 
                      v-if="!isDeleteMode"
                      @click="openModal(player)"
                      class="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                    >
                      View
                    </button>
                     <button 
                      v-else
                      @click.stop="confirmDelete(player)"
                      class="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
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
              
              <div class="flex flex-col">
                <div 
                  v-for="(detail, i) in selectedPlayer.details" 
                  :key="detail.id"
                  class="group flex items-start gap-4 p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-all rounded-lg"
                >
                  <!-- Sequence/Index for visual list feeling -->
                  <div class="mt-1 font-mono text-xs text-slate-300 w-6 text-right pt-2">{{ i + 1 }}.</div>

                  <!-- Status Icon (Smaller & Sleeker) -->
                  <div class="mt-1 shrink-0">
                    <div v-if="detail.isCorrect" class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm shadow-blue-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div v-else class="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center shadow-sm shadow-red-200">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </div>
                  </div>
                  
                  <!-- Info -->
                  <div class="flex-1 min-w-0"> <!-- min-w-0 for text truncation to work if needed -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-1">
                       <h4 class="font-bold text-slate-800 text-lg leading-snug">{{ detail.choiceText }}</h4>
                       <span 
                         class="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 w-fit"
                         :class="detail.isCorrect ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-red-50 text-red-600 border border-red-100'"
                       >
                         {{ detail.isCorrect ? 'Correct' : 'Incorrect' }}
                       </span>
                    </div>
                    
                    <div class="flex items-center gap-4 text-xs text-slate-400 mt-1">
                       <span class="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">ID: {{ detail.choiceId }}</span>
                       <span class="flex items-center gap-1">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                         Selected: {{ detail.wasClicked ? 'Yes' : 'No' }}
                       </span>
                       <span class="flex items-center gap-1" v-if="detail.attemptNo > 0">
                         <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="closeDeleteModal"></div>
        
        <div class="relative bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </div>
          
          <h3 class="text-lg font-bold text-slate-800 mb-2">Delete Score?</h3>
          <p class="text-slate-500 text-sm mb-6">Are you sure you want to delete <span class="font-bold text-slate-800">{{ scoreToDelete?.name }}</span>'s score? This action cannot be undone.</p>
          
          <div class="flex gap-3 justify-center">
            <button 
              @click="closeDeleteModal" 
              class="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="deleteScore" 
              :disabled="deleting"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold text-sm shadow-sm shadow-red-200 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span v-if="deleting">Deleting...</span>
              <span v-else>Confirm Delete</span>
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
