<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Sparkles, LogOut } from 'lucide-vue-next'

// 引用我們預計建立的組件
import LoginOverlay from './components/LoginOverlay.vue'
import BubbleMap from './components/BubbleMap.vue'
import VoteForm from './components/VoteForm.vue'
import HeatmapCalendar from './components/HeatmapCalendar.vue'
import AIConsultant from './components/AIConsultant.vue'

// --- 1. 核心狀態 (State) ---
const GAS_URL = "https://script.google.com/macros/s/AKfycbzYzsvmT79fUHboA8KqP8ofsCX59cavoGw2S0aCLgTLPUjJDtsrMilrYvbHd6oEhB--/exec";
const isLoggedIn = ref(false)
const isLoading = ref(false)
const loadingText = ref("載入中...")
const currentUser = ref("")
const userList = ref([])
const showAI = ref(false)

const state = reactive({
  destinations: [],
  factors: [
    { name: "美食", votes: [], icon: "utensils" },
    { name: "好買", votes: [], icon: "shopping-bag" },
    { name: "天氣", votes: [], icon: "sun" },
    { name: "景觀", votes: [], icon: "camera" }
  ],
  budgets: { "1萬以內": [], "1-2萬": [], "2-3萬": [], "3萬以上": [] },
  dates: {}, 
  rawVotes: [], 
  totalVoters: 0
})

// --- 2. 資料解析邏輯 (原本的 parseSheetData) ---
const parseData = (rows) => {
  // 重置狀態
  state.destinations = [];
  state.factors.forEach(f => f.votes = []);
  Object.keys(state.budgets).forEach(k => state.budgets[k] = []);
  state.dates = {};
  
  let uniqueVoters = new Set();
  rows.forEach(row => {
    const [timestamp, name, destStr, budget, factorsStr, datesStr] = row;
    if(name) uniqueVoters.add(name);
    
    // 解析目的地
    const dests = destStr ? destStr.split(', ') : [];
    dests.forEach(dest => {
      let dObj = state.destinations.find(d => d.name === dest);
      if(!dObj) {
        dObj = { name: dest, votes: [] };
        state.destinations.push(dObj);
      }
      if(!dObj.votes.includes(name)) dObj.votes.push(name);
    });

    // 解析預算與因素 (以此類推...)
    if(budget && state.budgets[budget]) state.budgets[budget].push(name);
    
    const factors = factorsStr ? factorsStr.split(', ') : [];
    factors.forEach(fName => {
      let fObj = state.factors.find(f => f.name === fName);
      if(fObj && !fObj.votes.includes(name)) fObj.votes.push(name);
    });

    const datesArr = datesStr ? datesStr.split(', ') : [];
    datesArr.forEach(dStr => {
      if (!state.dates[dStr]) state.dates[dStr] = [];
      state.dates[dStr].push(name);
    });
  });
  state.totalVoters = uniqueVoters.size || 1;
}

// --- 3. API 串接 ---
const fetchData = async () => {
  isLoading.value = true;
  try {
    const res = await fetch(GAS_URL);
    const data = await res.json();
    userList.value = data.users;
    if (data.votes) parseData(data.votes.slice(1));
  } catch (e) {
    console.error("資料載入失敗", e);
  } finally {
    isLoading.value = false;
  }
}

const handleLogin = (user) => {
  currentUser.value = user;
  isLoggedIn.value = true;
  // 這裡可以加入 fillExistingVoteData 的邏輯
}

onMounted(() => {
  fetchData();
})
</script>

<template>
  <div class="min-h-screen bg-[#f9f9f6] text-slate-800 font-sans">
    <div v-if="isLoading" class="fixed inset-0 bg-white/80 backdrop-blur-md z-[200] flex flex-col items-center justify-center">
      <div class="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
      <p class="font-bold text-slate-600 tracking-widest text-sm">{{ loadingText }}</p>
    </div>

    <LoginOverlay 
      v-if="!isLoggedIn" 
      :userList="userList" 
      @login="handleLogin" 
    />

    <template v-else>
      <nav class="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <h1 class="font-serif font-black text-xl tracking-tight text-slate-800">最後的旅行 LastTrip</h1>
        <div class="flex items-center gap-4">
          <button @click="showAI = !showAI" class="flex items-center gap-2 text-blue-700 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full shadow-sm">
            <Sparkles :size="16" /> AI 推薦
          </button>
          <span class="text-sm font-bold text-slate-500 hidden sm:inline">你好，{{ currentUser }}</span>
          <button @click="isLoggedIn = false" class="text-slate-400 hover:text-red-500"><LogOut :size="20" /></button>
        </div>
      </nav>

      <main class="max-w-6xl mx-auto px-6 py-10 space-y-12">
        <AIConsultant v-if="showAI" :state="state" @close="showAI = false" />
        
        <BubbleMap :destinations="state.destinations" />

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div class="space-y-10">
            <HeatmapCalendar :dates="state.dates" :totalVoters="state.totalVoters" />
          </div>
          <VoteForm :state="state" :currentUser="currentUser" @refresh="fetchData" />
        </div>
      </main>
    </template>
  </div>
</template>