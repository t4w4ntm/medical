<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardLayout from '../layouts/DashboardLayout.vue'

interface ScoreDetail {
  id: number
  choiceId: string
  choiceText: string
  questionText?: string
  scenario?: string
  patientIndex?: number
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
  details?: ScoreDetail[] 
}

const router = useRouter()
const currentUser = ref<any>(null)

const scores = ref<Score[]>([])
const loading = ref(true)

const searchTerm = ref('')

// Pagination
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10000) // Show all (as per request)
const totalItems = ref(0)
// Removed handleLogout as it is in Sidebar now

// Sorting
type SortKey = 'createdAt' | 'name' | 'time' | 'timeScore' | 'questionScore' | 'totalScore'
const sortKey = ref<SortKey>('createdAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortBy = (key: SortKey) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc' 
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
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
    const res = await fetch(`${apiUrl}/score?page=${page}&limit=${limit.value}`)
    const data = await res.json()
    
    if (data.data) {
        scores.value = data.data
        totalItems.value = data.total
        currentPage.value = page
        totalPages.value = Math.ceil(data.total / limit.value)
    } else {
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
  if (scoreToDelete.value) {
      deleting.value = true
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
        const res = await fetch(`${apiUrl}/score/${scoreToDelete.value.id}`, {
          method: 'DELETE'
        })
        
        if (res.ok) {
          scores.value = scores.value.filter(s => s.id !== scoreToDelete.value?.id)
          totalItems.value--
          closeDeleteModal()
        } else {
          console.error('Failed to delete score')
        }
      } catch (error) {
        console.error('Error deleting score:', error)
      } finally {
        deleting.value = false
      }
  } else if (selectedIds.value.size > 0) {
      deleting.value = true
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app'
        const res = await fetch(`${apiUrl}/score/bulk-delete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ids: Array.from(selectedIds.value),
                deleteAll: false // Always sending IDs now
            })
        })

        if (res.ok) {
            scores.value = scores.value.filter(s => !selectedIds.value.has(s.id))
            totalItems.value = scores.value.length
            
            selectedIds.value.clear()
            isSelectAllGlobal.value = false
            // fetchScores(1) // No need to re-fetch if we update locally, acts faster
            closeDeleteModal()
        } else {
            console.error('Failed to bulk delete')
        }
      } catch (error) {
        console.error('Error bulk deleting:', error)
      } finally {
        deleting.value = false
      }
  }
}

// Bulk Selection
const selectedIds = ref<Set<number>>(new Set())
const isSelectAllGlobal = ref(false)

const toggleSelectAll = () => {
    if (isSelectAllGlobal.value) {
        // Was checked, now uncheck all
        isSelectAllGlobal.value = false
        selectedIds.value.clear()
    } else {
        // Was unchecked, now check all loaded items
        isSelectAllGlobal.value = true
        // Add all filtered IDs (or all loaded IDs)
        // Better to select visible/filtered items if search is active? 
        // User asked for "everyone", usually means all in list. 
        // We use filteredScores to respect search results if any, or scores if no search.
        // Let's use filteredScores for better UX (delete what you see).
        filteredScores.value.forEach(s => selectedIds.value.add(s.id))
    }
}

const toggleSelection = (id: number) => {
    if (selectedIds.value.has(id)) {
        selectedIds.value.delete(id)
        isSelectAllGlobal.value = false
    } else {
        selectedIds.value.add(id)
        // If we selected the last one, mark global true (optional UI polish)
        if (selectedIds.value.size === filteredScores.value.length && filteredScores.value.length > 0) {
            isSelectAllGlobal.value = true
        }
    }
}

const selectedCount = computed(() => selectedIds.value.size)

const confirmBulkDelete = () => {
    if (selectedCount.value === 0) return
    scoreToDelete.value = null // Ensure single delete mode is off
    showDeleteModal.value = true
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
      return (a[sortKey.value] - b[sortKey.value]) * modifier
    }
  })
})

const groupedDetails = computed(() => {
   if (!selectedPlayer.value?.details) return []
   const map = new Map<string, ScoreDetail[]>()
   
   selectedPlayer.value.details.forEach(d => {
       // Filter out unattempted choices
       if (!d.attemptNo || d.attemptNo === 0) return

       // Group by Question Text + Patient Index (if available)
       let key = d.questionText || 'General Questions'
       
       if (d.patientIndex !== undefined && d.patientIndex !== null) {
           key += ` (Patient ${d.patientIndex + 1})`
       }
       
       if (!map.has(key)) map.set(key, [])
       map.get(key)!.push(d)
   })
   
   // Sort answers by attemptNo
   return Array.from(map.entries()).map(([question, answers]) => ({ 
       question, 
       answers: answers.sort((a, b) => a.attemptNo - b.attemptNo) 
   }))
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
  <DashboardLayout>
    <div class="max-w-7xl mx-auto">
      <header class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div class="flex items-center gap-4">
          <h1 class="text-3xl font-black text-slate-800 tracking-tight">Game Scoreboard</h1>
           
           <div class="relative bg-white rounded-full shadow-sm border border-slate-200">
              <input 
                v-model="searchTerm"
                type="text" 
                placeholder="Search Student ID..." 
                class="pl-10 pr-4 py-2 bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64 text-sm"
              />
              <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
        </div>
        
        <div class="flex flex-col items-end gap-3">
          <div class="flex items-center gap-2">
            <button 
              @click="isDeleteMode = !isDeleteMode" 
              class="p-2 border rounded-lg shadow-sm transition-colors"
              :class="isDeleteMode ? 'bg-red-100 text-red-600 border-red-200' : 'bg-white hover:bg-slate-50 text-slate-400 border-slate-200'"
              title="Toggle Delete Mode"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>

            <button 
                v-if="isDeleteMode && selectedCount > 0"
                @click="confirmBulkDelete"
                class="ml-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg shadow-sm shadow-red-200 hover:bg-red-700 transition-colors flex items-center gap-2"
            >

                Delete ({{ selectedCount.toLocaleString() }})
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
                <th v-if="isDeleteMode" class="p-4 w-12 text-center">
                    <input 
                        type="checkbox" 
                        :checked="isSelectAllGlobal" 
                        @click="toggleSelectAll"
                        class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="(player, index) in filteredScores" 
                :key="player.id"
                class="hover:bg-slate-50 transition-colors group"
                :class="{'bg-blue-50/50': selectedIds.has(player.id)}"
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
                <td v-if="isDeleteMode" class="p-4 text-center">
                    <input 
                        type="checkbox" 
                        :checked="selectedIds.has(player.id)"
                        @click="toggleSelection(player.id)" 
                        class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                    />
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
              <p class="text-slate-500 text-sm" v-if="selectedPlayer">Player: <span class="font-bold text-blue-600">{{ selectedPlayer.name }}</span></p>
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
              <div v-for="(group, index) in groupedDetails" :key="index" class="mb-6 last:mb-0">
                  <h3 class="text-lg font-bold text-slate-800 mb-2 flex items-start gap-2">
                      <span class="text-slate-400 font-mono text-base mt-0.5">{{ index + 1 }}.</span>
                      {{ group.question }}
                  </h3>
                  
                  <div class="flex flex-col gap-2 pl-6">
                    <div 
                      v-for="detail in group.answers" 
                      :key="detail.id"
                      class="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                    >
                      <!-- Icon -->
                      <div class="mt-0.5 shrink-0">
                        <div v-if="detail.isCorrect" class="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        </div>
                        <div v-else class="w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center text-white">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </div>
                      </div>
                      
                      <!-- Text -->
                      <div class="flex-1">
                          <p class="text-slate-700 font-medium leading-snug">{{ detail.choiceText }}</p>
                          <p class="text-xs text-slate-400 mt-1" v-if="detail.isCorrect">
                              {{ detail.isCorrect ? 'Correct Answer' : 'Selected Answer' }}
                          </p>
                      </div>
                    </div>
                  </div>
              </div>
            </div>
            
            <div v-else-if="selectedPlayer && (!selectedPlayer.details || selectedPlayer.details.length === 0)" class="text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
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
          
          <h3 class="text-lg font-bold text-slate-800 mb-2">{{ scoreToDelete ? 'Delete Score?' : 'Delete Selected Scores?' }}</h3>
          <p class="text-slate-500 text-sm mb-6">
            <span v-if="scoreToDelete">Are you sure you want to delete <span class="font-bold text-slate-800">{{ scoreToDelete.name }}</span>'s score?</span>
            <span v-else>Are you sure you want to delete <span class="font-bold text-red-600">{{ selectedCount.toLocaleString() }}</span> selected items?</span> 
            This action cannot be undone.
          </p>
          
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
  </DashboardLayout>
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
