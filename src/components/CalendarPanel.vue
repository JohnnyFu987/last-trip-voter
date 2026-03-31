<template>
  <section class="card-panel p-5 md:p-8">
    <h3 class="text-base md:text-lg font-black mb-4 md:mb-6 text-slate-800 border-l-4 border-slate-800 pl-3">旅行有空日期熱度圖</h3>
    <p class="text-[11px] md:text-xs text-slate-500 mb-4 font-bold">
        顏色越深代表越多夥伴有空，<span class="text-blue-600">點選深色日期</span>即可查看名單。
    </p>
    
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
                     @click="handleDayClick(day)"
                     class="relative aspect-square flex flex-col items-center justify-center rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all box-border group active:scale-95"
                     :class="[day.voters.length > 0 ? 'cursor-pointer hover:ring-2 hover:ring-slate-400' : 'cursor-default']"
                     :style="getHeatmapStyle(day.voters)">
                    
                    <span>{{ day.dayNum }}</span>
                    
                    <div v-if="day.voters.length > 0" class="w-1 h-1 rounded-full mt-0.5" 
                         :class="day.voters.length > (store.totalVoters / 2) ? 'bg-white/60' : 'bg-slate-400'">
                    </div>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { store, uiState } from '../store';

/**
 * 核心修正：對接 store.js 中的變數名稱
 * 使用 uiState.modalData 與 uiState.isModalOpen
 */
const handleDayClick = (day) => {
    // 檢查是否有投票者
    if (!day.voters || day.voters.length === 0) return;

    // 關鍵修正：屬性名稱必須對應 VoterModal.vue 裡的 name 與 votes
    uiState.modalData = {
        name: `${day.dateStr} 有空的夥伴`, // 對應 VoterModal 的 name
        votes: day.voters,               // 對應 VoterModal 的 votes (陣列)
        color: '#2d3e30'                 // 彈窗上方顏色
    };
    
    uiState.isModalOpen = true; 
};

const changeMonth = (delta) => {
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
        return { 
            dayNum: d, 
            dateStr, 
            voters: store.dates[dateStr] || [] 
        };
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
            border: `1px solid rgba(45,62,48, 0.1)`,
        };
    }
    return { backgroundColor: '#f8fafc', color: '#94a3b8' };
};
</script>