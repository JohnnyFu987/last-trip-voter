<template>
  <section class="bg-white p-5 md:p-7 rounded-[1.5rem] shadow-sm border border-slate-100 h-fit lg:sticky lg:top-24">
    <h3 class="text-lg md:text-xl font-black mb-5 md:mb-6 text-slate-800">開始投票 / 修改投票</h3>
    <form @submit.prevent="submitVote" class="space-y-5 md:space-y-6">
      
      <div>
        <div class="flex justify-between items-center mb-2">
            <label class="text-[11px] md:text-xs font-bold text-slate-600 uppercase tracking-wide">你想去哪裡？ (可複選)</label>
            <button type="button" @click="addDest" class="text-[11px] md:text-xs font-bold text-blue-600 hover:underline">+ 新增地點</button>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
            <label v-for="d in store.destinations" :key="d.name" class="flex items-center justify-center p-2.5 md:p-2 rounded-lg border border-slate-100 cursor-pointer text-xs transition-all has-[:checked]:bg-slate-800 has-[:checked]:text-white shadow-sm font-bold">
                <input type="checkbox" v-model="formData.destinations" :value="d.name" class="hidden">
                <span>{{ d.name }}</span>
            </label>
        </div>
      </div>

      <div>
        <label class="block text-[11px] md:text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">預算</label>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <label v-for="b in Object.keys(store.budgets)" :key="b" class="cursor-pointer">
                <input type="radio" v-model="formData.budget" :value="b" class="hidden peer">
                <div class="p-2.5 md:p-2 text-center border-2 border-slate-100 rounded-lg peer-checked:border-slate-800 peer-checked:bg-slate-800 peer-checked:text-white transition-all font-bold text-xs">{{ b }}</div>
            </label>
        </div>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
            <label class="text-[11px] md:text-xs font-bold text-slate-600 uppercase tracking-wide">重視考量 (可複選)</label>
            <button type="button" @click="addFactor" class="text-[11px] md:text-xs font-bold text-blue-600 hover:underline">+ 新增因素</button>
        </div>
        <div class="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-2">
            <label v-for="f in store.factors" :key="f.name" class="flex items-center justify-center p-2.5 md:p-2 rounded-lg border border-slate-100 cursor-pointer text-xs transition-all has-[:checked]:bg-slate-800 has-[:checked]:text-white shadow-sm font-bold">
                <input type="checkbox" v-model="formData.factors" :value="f.name" class="hidden">
                <span>{{ f.name }}</span>
            </label>
        </div>
      </div>

      <div>
        <label class="block text-[11px] md:text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">你有空的日期 (可複選)</label>
        <div class="bg-slate-50 p-3 md:p-4 rounded-xl border border-slate-100">
            <div class="flex items-center justify-between mb-3 md:mb-4 px-1">
                <button type="button" @click="changeMonth(-1)" class="flex items-center gap-1 text-[11px] md:text-sm font-bold text-slate-500 hover:text-slate-800 transition bg-white p-1.5 md:p-2 rounded-lg shadow-sm">
                    <i data-lucide="chevron-left" class="w-3.5 h-3.5 md:w-4 md:h-4"></i> 上月
                </button>
                <div class="text-center font-bold text-slate-700 text-sm md:text-base">
                    {{ calYear }}年 {{ calMonth + 1 }}月
                </div>
                <button type="button" @click="changeMonth(1)" class="flex items-center gap-1 text-[11px] md:text-sm font-bold text-slate-500 hover:text-slate-800 transition bg-white p-1.5 md:p-2 rounded-lg shadow-sm">
                    下月 <i data-lucide="chevron-right" class="w-3.5 h-3.5 md:w-4 md:h-4"></i>
                </button>
            </div>
            
            <div class="grid grid-cols-7 gap-1 text-center text-[10px] md:text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
                <div v-for="n in firstDayOffset" :key="'empty-'+n"></div>
                <div v-for="day in daysInMonth" :key="day.dateStr"
                     @click="toggleDate(day.dateStr)"
                     :class="[
                         'aspect-square flex items-center justify-center cursor-pointer rounded-lg md:rounded-xl text-xs md:text-sm font-bold select-none transition-all duration-200 box-border shadow-sm',
                         store.selectedDates.includes(day.dateStr) 
                             ? 'bg-slate-800 text-white border-slate-800' 
                             : 'bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-600'
                     ]">
                    {{ day.dayNum }}
                </div>
            </div>
        </div>
      </div>

      <button type="submit" :disabled="isSubmitting" class="btn-primary w-full py-4 rounded-xl md:rounded-2xl font-bold text-base md:text-lg shadow-md mt-2">
        {{ isSubmitting ? '傳送中...' : '送出投票並儲存' }}
      </button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, watch, computed } from 'vue';
import { store, uiState, apiService } from '../store';
import { API_CONFIG, BUBBLE_COLORS } from '../config/api';

const isSubmitting = ref(false);
const formData = reactive({
    destinations: [],
    budget: '1萬以內',
    factors: []
});

// 日曆內部狀態
const calYear = ref(2026);
const calMonth = ref(5); // 0-based, 5 代表 6月

// 切換月份邏輯
const changeMonth = (delta) => {
    let m = calMonth.value + delta;
    let y = calYear.value;
    if (m > 11) { m -= 12; y++; }
    if (m < 0) { m += 12; y--; }
    calMonth.value = m;
    calYear.value = y;
};

// 計算當月第一天是星期幾，用來產生空白網格
const firstDayOffset = computed(() => new Date(calYear.value, calMonth.value, 1).getDay());

// 計算當月有幾天，並產生帶有完整日期字串的陣列
const daysInMonth = computed(() => {
    const days = new Date(calYear.value, calMonth.value + 1, 0).getDate();
    return Array.from({ length: days }, (_, i) => {
        const d = i + 1;
        const dateStr = `${calYear.value}-${String(calMonth.value + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return { dayNum: d, dateStr };
    });
});

// 切換選取日期
const toggleDate = (dateStr) => {
    const idx = store.selectedDates.indexOf(dateStr);
    if (idx > -1) {
        store.selectedDates.splice(idx, 1);
    } else {
        store.selectedDates.push(dateStr);
    }
};

// 載入舊資料
watch(() => uiState.isLoggedIn, (newVal) => {
    if (newVal) {
        const vote = store.rawVotes.find(v => v[1] === store.currentUser);
        if (vote) {
            formData.destinations = vote[2] ? vote[2].split(', ') : [];
            formData.budget = vote[3] || '1萬以內';
            formData.factors = vote[4] ? vote[4].split(', ') : [];
        }
    }
}, { immediate: true });

const addDest = () => {
    const name = prompt("想新增什麼地點？");
    if (name && !store.destinations.find(d => d.name === name)) {
        store.destinations.push({ name, votes: [], color: BUBBLE_COLORS[store.destinations.length % BUBBLE_COLORS.length] });
    }
};

const addFactor = () => {
    const name = prompt("想新增什麼因素？");
    if (name && !store.factors.find(f => f.name === name)) {
        store.factors.push({ name, votes: [], icon: "check" });
    }
};

const submitVote = async () => {
    if (formData.destinations.length === 0) return alert("請至少選擇一個你想去的目的地！");
    
    isSubmitting.value = true;
    uiState.isLoading = true;
    uiState.loadingText = "正在儲存你的專屬設定...";

    try {
        const response = await fetch(API_CONFIG.GAS_URL, {
            method: 'POST',
            body: JSON.stringify({
                userName: store.currentUser,
                destinations: formData.destinations,
                budget: formData.budget,
                factors: formData.factors,
                dates: store.selectedDates
            })
        });
        const result = await response.json();
        if (result.result === "success") {
            await apiService.fetchInitialData();
            alert("設定已更新並儲存至雲端！");
        } else throw new Error("寫入失敗");
    } catch (e) {
        alert("儲存失敗: " + e.message);
    } finally {
        isSubmitting.value = false;
        uiState.isLoading = false;
    }
};
</script>