<template>
  <section class="card-panel p-5 md:p-8">
    <h3 class="text-base md:text-lg font-black mb-4 md:mb-6 text-slate-800 border-l-4 border-slate-800 pl-3">旅行有空日期熱度圖</h3>
    <p class="text-[11px] md:text-xs text-slate-500 mb-4 font-bold">顏色越深代表越多夥伴有空，<span class="text-blue-600">點選</span>日期可看名單。</p>
    
    <div class="flex items-center justify-between mb-3 md:mb-4 px-1">
        <button @click="changeMonth(-1)" class="flex items-center gap-1 text-[11px] md:text-sm font-bold text-slate-500 hover:text-slate-800 transition bg-white p-1.5 md:p-2 rounded-lg shadow-sm">
            <i data-lucide="chevron-left" class="w-3.5 h-3.5 md:w-4 md:h-4"></i> 上月
        </button>
        <button @click="changeMonth(1)" class="flex items-center gap-1 text-[11px] md:text-sm font-bold text-slate-500 hover:text-slate-800 transition bg-white p-1.5 md:p-2 rounded-lg shadow-sm">
            下月 <i data-lucide="chevron-right" class="w-3.5 h-3.5 md:w-4 md:h-4"></i>
        </button>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 px-1">
        <div v-for="monthData in calendarData" :key="monthData.key">
            <div class="text-center font-bold text-slate-700 mb-2 md:mb-3 text-sm md:text-base">{{ monthData.year }}年 {{ monthData.monthName }}</div>
            <div class="grid grid-cols-7 gap-1 text-center text-[10px] md:text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-widest">
                <div>日</div><div>一</div><div>二</div><div>三</div><div>四</div><div>五</div><div>六</div>
            </div>
            <div class="grid grid-cols-7 gap-1">
                <div v-for="n in monthData.firstDay" :key="'blank-'+n"></div>
                <div v-for="day in monthData.days" :key="day.dateStr" 
                     @click="showVoterList(day)"
                     class="relative aspect-square flex items-center justify-center rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all box-border group cursor-pointer active:scale-95"
                     :style="getHeatmapStyle(day.voters)">
                    {{ day.dayNum }}
                    
                    <div v-if="day.voters.length > 0" class="absolute bottom-[110%] left-1/2 -translate-x-1/2 mb-1 hidden lg:group-hover:flex flex-col items-center z-50 pointer-events-none w-max">
                        <div class="bg-slate-800 text-white text-[11px] md:text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
                            {{ day.voters.length }} 人有空
                        </div>
                        <div class="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-800"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { store, uiState } from '../store'; // 引入 uiState 以控制 Modal

const changeMonth = (delta) => { 
    // 簡單的跨年/跨月邏輯處理
    let newMonth = store.currentCalMonth + delta;
    if (newMonth > 11) {
        store.currentCalYear++;
        store.currentCalMonth = 0;
    } else if (newMonth < 0) {
        store.currentCalYear--;
        store.currentCalMonth = 11;
    } else {
        store.currentCalMonth = newMonth;
    }
};

// 修改處：點擊顯示名單的邏輯
const showVoterList = (day) => {
    if (day.voters.length === 0) return;
    
    // 設定 Modal 顯示的標題與名單內容
    uiState.modalTitle = `${day.dateStr} 有空的夥伴`;
    uiState.modalList = day.voters;
    uiState.showModal = true;
};

const generateMonthData = (year, monthIndex) => {
    let y = year, m = monthIndex;
    if (m > 11) { m -= 12; y++; }
    if (m < 0) { m += 12; y--; }

    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const monthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
    
    const days = Array.from({ length: daysInMonth }, (_, i) => {
        const d = i + 1;
        const dateStr = `${y}-${String(m+1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        return { dayNum: d, dateStr, voters: store.dates[dateStr] || [] };
    });

    return { key: `${y}-${m}`, year: y, monthName: monthNames[m], firstDay, days };
};

const calendarData = computed(() => [
    generateMonthData(store.currentCalYear, store.currentCalMonth),
    generateMonthData(store.currentCalYear, store.currentCalMonth + 1)
]);

const getHeatmapStyle = (voters) => {
    const intensity = store.totalVoters ? (voters.length / store.totalVoters) : 0;
    if (intensity > 0) {
        return {
            backgroundColor: `rgba(45, 62, 48, ${intensity})`,
            color: intensity > 0.4 ? 'white' : '#2d3e30',
            border: `1px solid rgba(45,62,48, ${intensity})`,
        };
    }
    return { backgroundColor: '#f8fafc', color: '#94a3b8', cursor: 'default' };
};
</script>