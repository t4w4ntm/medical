<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// ✅ Interface ตรงกับ Database เป๊ะๆ (ไม่มี bedId แล้ว)
interface Score {
  id: number
  name: string
  score: number
}

const scores = ref<Score[]>([])
const isLoaded = ref(false)

const fetchScores = async () => {
  try {
    const apiUrl =
      import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app/score'
    const res = await fetch(`${apiUrl}/score`)

    const data = await res.json()
    // เรียงคะแนนจากมากไปน้อย
    scores.value = data.sort((a: Score, b: Score) => b.score - a.score)
    isLoaded.value = true
  } catch (error) {
    console.error('Error fetching scores:', error)
  }
}

const topThree = computed(() => scores.value.slice(0, 3))
const restOfList = computed(() => scores.value.slice(3))

onMounted(() => {
  fetchScores()
  // ดึงข้อมูลใหม่ทุกๆ 2 วินาที (Realtime)
  setInterval(fetchScores, 2000)
})
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 relative overflow-hidden"
  >
    <div
      class="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
      style="
        background-image: linear-gradient(#10b98120 1px, transparent 1px),
          linear-gradient(90deg, #10b98120 1px, transparent 1px);
        background-size: 40px 40px;
      "
    ></div>

    <div
      class="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-0 pointer-events-none"
    ></div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      <header class="text-center mb-12">
        <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-800">
          SIMULATION <span class="text-emerald-600">LEADERBOARD</span>
        </h1>
        <p
          class="text-slate-500 text-sm md:text-base uppercase tracking-[0.2em] font-medium bg-white/80 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-slate-200"
        >
          Top Nursing Performance
        </p>
      </header>

      <TransitionGroup
        tag="div"
        name="podium"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 items-end"
        v-if="scores.length > 0"
      >
        <div
          v-if="topThree[1]"
          class="order-2 md:order-1 bg-white border border-slate-200 p-6 rounded-xl shadow-lg transform transition hover:-translate-y-2 duration-300 relative group"
        >
          <div
            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm"
          >
            RANK 2
          </div>
          <div class="text-center mt-2">
            <div class="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">🥈</div>
            <div class="font-bold text-xl text-slate-800 truncate">{{ topThree[1].name }}</div>
            <div class="text-2xl font-mono font-bold text-slate-400 mt-2">
              {{ topThree[1].score.toLocaleString() }}
            </div>
          </div>
        </div>

        <div
          v-if="topThree[0]"
          class="order-1 md:order-2 bg-white border-2 border-emerald-500 p-8 rounded-2xl shadow-2xl shadow-emerald-500/20 transform transition hover:-translate-y-2 duration-300 relative overflow-hidden z-20"
        >
          <div class="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <div class="text-center">
            <div class="text-6xl mb-4 animate-bounce">🏆</div>
            <div class="text-emerald-600 text-xs font-black uppercase tracking-widest mb-2">
              Current Champion
            </div>
            <div class="font-black text-2xl md:text-3xl text-slate-900 truncate mb-2">
              {{ topThree[0].name }}
            </div>

            <div class="text-5xl font-mono font-black text-emerald-600 tracking-tight">
              {{ topThree[0].score.toLocaleString() }}
            </div>
          </div>
        </div>

        <div
          v-if="topThree[2]"
          class="order-3 md:order-3 bg-white border border-slate-200 p-6 rounded-xl shadow-lg transform transition hover:-translate-y-2 duration-300 relative group"
        >
          <div
            class="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-800 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm"
          >
            RANK 3
          </div>
          <div class="text-center mt-2">
            <div class="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">🥉</div>
            <div class="font-bold text-xl text-slate-800 truncate">{{ topThree[2].name }}</div>
            <div class="text-2xl font-mono font-bold text-slate-400 mt-2">
              {{ topThree[2].score.toLocaleString() }}
            </div>
          </div>
        </div>
      </TransitionGroup>

      <div class="space-y-3">
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-slate-400 text-sm font-bold uppercase tracking-wider whitespace-nowrap">
            Challenger List
          </h3>
          <div class="h-[1px] w-full bg-slate-200"></div>
        </div>

        <TransitionGroup name="list" tag="div">
          <div
            v-for="(item, index) in restOfList"
            :key="item.id"
            class="group flex items-center bg-white border border-slate-200 hover:border-emerald-400 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-emerald-50/30"
          >
            <div
              class="w-12 text-center font-mono text-slate-400 font-bold text-lg group-hover:text-emerald-600"
            >
              {{ index + 4 }}
            </div>
            <div class="flex-1 min-w-0 pr-4">
              <div
                class="font-bold text-slate-700 truncate group-hover:text-emerald-700 transition-colors text-lg"
              >
                {{ item.name }}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-slate-400 md:hidden">ID: {{ item.id }}</span>
              </div>
            </div>

            <div class="text-right pl-4 border-l border-slate-100">
              <div class="font-mono text-xl font-bold text-slate-600 group-hover:text-emerald-600">
                {{ item.score.toLocaleString() }}
              </div>
            </div>
          </div>
        </TransitionGroup>

        <div
          v-if="scores.length === 0 && isLoaded"
          class="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50"
        >
          <p class="text-slate-400 font-medium">Waiting for data...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Podium Animation */
.podium-enter-active,
.podium-leave-active {
  transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
} /* เด้งดึ๋ง */
.podium-enter-from {
  opacity: 0;
  transform: translateY(100px) scale(0.5);
}

/* List Animation */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
.list-leave-active {
  position: absolute;
  width: 100%;
  z-index: -1;
}

/* ============================================
   MOBILE RESPONSIVE STYLES
   ============================================ */
@media (max-width: 767px) {
  /* Main Container - Keep original light theme */
  .min-h-screen {
    padding-bottom: 2rem !important;
  }

  /* Header styling for mobile */
  header h1 {
    font-size: 1.5rem !important;
  }
  header p {
    font-size: 0.65rem !important;
  }
  header {
    margin-bottom: 1.5rem !important;
  }

  /* ===== PODIUM SECTION (Top 3) ===== */
  .grid.grid-cols-1.md\:grid-cols-3 {
    display: flex !important;
    flex-direction: row !important;
    justify-content: center !important;
    align-items: flex-end !important;
    gap: 0.5rem !important;
    margin-bottom: 1.5rem !important;
    padding: 0 0.5rem;
  }

  /* Reset all podium cards for mobile */
  .grid.grid-cols-1.md\:grid-cols-3 > div {
    flex: 1 !important;
    max-width: 110px !important;
    padding: 0.75rem 0.5rem !important;
    border-radius: 0.75rem !important;
    transform: none !important;
    margin: 0 !important;
  }

  /* Rank 2 (left) - White card like desktop */
  .grid.grid-cols-1.md\:grid-cols-3 > div.order-2.md\:order-1 {
    order: 1 !important;
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    height: 110px !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
  }

  /* Rank 1 (center) - White card with emerald border like desktop */
  .grid.grid-cols-1.md\:grid-cols-3 > div.order-1.md\:order-2 {
    order: 2 !important;
    background: white !important;
    border: 2px solid #10b981 !important;
    height: 130px !important;
    padding: 1rem 0.5rem !important;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.2) !important;
    z-index: 10 !important;
  }

  /* Rank 3 (right) - White card like desktop */
  .grid.grid-cols-1.md\:grid-cols-3 > div.order-3.md\:order-3 {
    order: 3 !important;
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    height: 100px !important;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  /* Hide rank badges on mobile podium */
  .grid.grid-cols-1.md\:grid-cols-3 > div > div:first-child:not(.text-center) {
    display: none !important;
  }

  /* Podium text styling */
  .grid.grid-cols-1.md\:grid-cols-3 .text-center {
    margin-top: 0 !important;
  }
  .grid.grid-cols-1.md\:grid-cols-3 .text-center > div:first-child {
    font-size: 1.75rem !important;
    margin-bottom: 0.25rem !important;
    animation: none !important;
  }
  /* Rank 1 trophy bigger */
  .grid.grid-cols-1.md\:grid-cols-3 > div.order-1.md\:order-2 .text-center > div:first-child {
    font-size: 2.25rem !important;
  }

  /* Name styling on podium */
  .grid.grid-cols-1.md\:grid-cols-3 .font-bold.text-xl,
  .grid.grid-cols-1.md\:grid-cols-3 .font-black.text-2xl {
    font-size: 0.7rem !important;
    color: #1e293b !important;
    font-weight: 600 !important;
    line-height: 1.2 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }

  /* Score styling on podium */
  .grid.grid-cols-1.md\:grid-cols-3 .font-mono.text-2xl,
  .grid.grid-cols-1.md\:grid-cols-3 .font-mono.text-5xl {
    font-size: 1.1rem !important;
    color: #64748b !important;
    margin-top: 0.25rem !important;
    font-weight: 700 !important;
  }
  /* Rank 1 score bigger and emerald color */
  .grid.grid-cols-1.md\:grid-cols-3 > div.order-1.md\:order-2 .font-mono {
    font-size: 1.4rem !important;
    color: #10b981 !important;
  }

  /* Hide "Current Champion" text on mobile */
  .grid.grid-cols-1.md\:grid-cols-3 .text-emerald-600.text-xs {
    display: none !important;
  }

  /* Hide top bar on rank 1 card */
  .grid.grid-cols-1.md\:grid-cols-3 > div > .absolute.top-0 {
    display: none !important;
  }

  /* ===== LIST SECTION (Rank 4+) ===== */
  .space-y-3 {
    padding: 0 0.75rem !important;
  }

  /* Hide "Challenger List" header on mobile */
  .space-y-3 > .flex.items-center.gap-4 {
    display: none !important;
  }

  /* List items styling - Gray/White theme */
  .space-y-3 .group.flex.items-center {
    background: white !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 0.5rem !important;
    padding: 0.75rem 1rem !important;
    margin-bottom: 0.5rem !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
  }

  /* Alternating stripe colors - Light gray tones */
  .space-y-3 .group.flex.items-center:nth-child(odd) {
    background: #f8fafc !important;
  }
  .space-y-3 .group.flex.items-center:nth-child(even) {
    background: white !important;
  }

  /* Rank number circle - Emerald theme */
  .space-y-3 .w-12.text-center {
    width: 2rem !important;
    height: 2rem !important;
    min-width: 2rem !important;
    background: #10b981 !important;
    color: white !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    font-size: 0.875rem !important;
    font-weight: 700 !important;
    margin-right: 0.75rem !important;
  }

  /* Name in list */
  .space-y-3 .flex-1.min-w-0 .font-bold {
    font-size: 0.95rem !important;
    color: #1e293b !important;
  }

  /* Score in list - Emerald color */
  .space-y-3 .text-right .font-mono {
    font-size: 1rem !important;
    color: #10b981 !important;
    font-weight: 700 !important;
  }

  /* Hide ID text */
  .space-y-3 .text-\[10px\] {
    display: none !important;
  }

  /* Border divider hide on mobile */
  .space-y-3 .border-l {
    border: none !important;
  }

  /* Empty state styling */
  .space-y-3 > div:last-child[class*='border-dashed'] {
    background: #f8fafc !important;
    border-color: #cbd5e1 !important;
  }
  .space-y-3 > div:last-child[class*='border-dashed'] p {
    color: #64748b !important;
  }
}
</style>