<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Score {
  id: number;
  playerName: string;
  score: number;
  bedId: number;
}

const scores = ref<Score[]>([]);
const isLoaded = ref(false);

const fetchScores = async () => {
  try {
    // แก้บรรทัดนี้: ดึง URL มาจาก .env แทนการพิมพ์เอง
    const apiUrl = import.meta.env.VITE_API_URL || 'https://medical-production-396d.up.railway.app/score';
    const res = await fetch(`${apiUrl}/score`);
    
    const data = await res.json();
    scores.value = data.sort((a: Score, b: Score) => b.score - a.score);
    isLoaded.value = true;
  } catch (error) {
    console.error('Error fetching scores:', error);
  }
};

const topThree = computed(() => scores.value.slice(0, 3));
const restOfList = computed(() => scores.value.slice(3));

onMounted(() => {
  fetchScores();
  setInterval(fetchScores, 2000);
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-100 selection:text-emerald-900 pb-20 relative overflow-hidden">
    
    <div class="absolute inset-0 z-0 pointer-events-none opacity-[0.4]"
         style="background-image: linear-gradient(#10b98120 1px, transparent 1px), linear-gradient(90deg, #10b98120 1px, transparent 1px); background-size: 40px 40px;">
    </div>
    
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white z-0 pointer-events-none"></div>

    <div class="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">
      
      <header class="text-center mb-12">
        <div class="inline-block p-3 rounded-full bg-white shadow-sm border border-emerald-100 mb-4">
          <span class="text-4xl">🏥</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-black tracking-tight mb-2 text-slate-800">
          SIMULATION <span class="text-emerald-600">LEADERBOARD</span>
        </h1>
        <p class="text-slate-500 text-sm md:text-base uppercase tracking-[0.2em] font-medium bg-white/80 inline-block px-4 py-1 rounded-full backdrop-blur-sm border border-slate-200">
          Top Nursing Performance
        </p>
      </header>

      <TransitionGroup 
        tag="div" 
        name="podium"
        class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-12 items-end"
        v-if="scores.length > 0"
      >
        <div v-if="topThree[1]" class="order-2 md:order-1 bg-white border border-slate-200 p-6 rounded-xl shadow-lg transform transition hover:-translate-y-2 duration-300 relative group">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-600 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">RANK 2</div>
          <div class="text-center mt-2">
            <div class="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">🥈</div>
            <div class="font-bold text-xl text-slate-800 truncate">{{ topThree[1].name }}</div>
            <div class="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
               {{ topThree[1].bedId === 0 ? 'Left Bed' : 'Right Bed' }}
            </div>
            <div class="text-2xl font-mono font-bold text-slate-400 mt-2">{{ topThree[1].score.toLocaleString() }}</div>
          </div>
        </div>

        <div v-if="topThree[0]" class="order-1 md:order-2 bg-white border-2 border-emerald-500 p-8 rounded-2xl shadow-2xl shadow-emerald-500/20 transform transition hover:-translate-y-2 duration-300 relative overflow-hidden z-20">
          <div class="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
          <div class="text-center">
            <div class="text-6xl mb-4 animate-bounce">🏆</div>
            <div class="text-emerald-600 text-xs font-black uppercase tracking-widest mb-2">Current Champion</div>
            <div class="font-black text-2xl md:text-3xl text-slate-900 truncate mb-2">{{ topThree[0].name }}</div>
            
            <div class="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 mb-4">
              {{ topThree[0].bedId === 0 ? 'LEFT BED' : 'RIGHT BED' }}
            </div>

            <div class="text-5xl font-mono font-black text-emerald-600 tracking-tight">
              {{ topThree[0].score.toLocaleString() }}
            </div>
          </div>
        </div>

        <div v-if="topThree[2]" class="order-3 md:order-3 bg-white border border-slate-200 p-6 rounded-xl shadow-lg transform transition hover:-translate-y-2 duration-300 relative group">
          <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-100 text-orange-800 px-3 py-0.5 rounded-full text-xs font-bold shadow-sm">RANK 3</div>
          <div class="text-center mt-2">
            <div class="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">🥉</div>
            <div class="font-bold text-xl text-slate-800 truncate">{{ topThree[2].name }}</div>
            <div class="inline-block px-2 py-0.5 mt-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
               {{ topThree[2].bedId === 0 ? 'Left Bed' : 'Right Bed' }}
            </div>
            <div class="text-2xl font-mono font-bold text-slate-400 mt-2">{{ topThree[2].score.toLocaleString() }}</div>
          </div>
        </div>
      </TransitionGroup>


      <div class="space-y-3">
        <div class="flex items-center gap-4 mb-4">
          <h3 class="text-slate-400 text-sm font-bold uppercase tracking-wider whitespace-nowrap">Challenger List</h3>
          <div class="h-[1px] w-full bg-slate-200"></div>
        </div>
        
        <TransitionGroup name="list" tag="div">
          <div 
            v-for="(item, index) in restOfList" 
            :key="item.id"
            class="group flex items-center bg-white border border-slate-200 hover:border-emerald-400 rounded-lg p-4 transition-all duration-200 shadow-sm hover:shadow-md hover:bg-emerald-50/30"
          >
            <div class="w-12 text-center font-mono text-slate-400 font-bold text-lg group-hover:text-emerald-600">
              {{ index + 4 }}
            </div>

            <div class="hidden md:flex w-10 h-10 bg-slate-100 rounded-full items-center justify-center mr-4 text-slate-400 group-hover:bg-white group-hover:text-emerald-500 transition-colors shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <div class="flex-1 min-w-0 pr-4">
              <div class="font-bold text-slate-700 truncate group-hover:text-emerald-700 transition-colors text-lg">
                {{ item.name }}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 font-bold uppercase">
                  {{ item.bedId === 0 ? 'Left Side' : 'Right Side' }}
                </span>
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

        <div v-if="scores.length === 0 && isLoaded" class="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50">
          <p class="text-slate-400 font-medium">Waiting for data...</p>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* Podium Animation */
.podium-enter-active, .podium-leave-active { transition: all 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); } /* เด้งดึ๋ง */
.podium-enter-from { opacity: 0; transform: translateY(100px) scale(0.5); }

/* List Animation */
.list-move, .list-enter-active, .list-leave-active { transition: all 0.5s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
.list-leave-active { position: absolute; width: 100%; z-index: -1; }
</style>