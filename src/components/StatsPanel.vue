<template>
  <div class="space-y-8 md:space-y-10">
    <section class="card-panel p-5 md:p-8">
        <h3 class="text-base md:text-lg font-black mb-4 md:mb-6 text-slate-800 border-l-4 border-slate-800 pl-3">重視因素</h3>
        <div class="space-y-4 md:space-y-6">
            <div v-for="f in store.factors" :key="f.name">
                <div class="flex justify-between items-end mb-2">
                    <span class="text-xs md:text-sm font-bold text-slate-700 flex items-center gap-2">
                        <i :data-lucide="f.icon || 'check'" class="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400"></i> {{ f.name }}
                    </span>
                    <span class="text-[11px] md:text-xs font-black text-slate-400">{{ f.votes.length }} 人在意</span>
                </div>
                <div class="w-full bg-slate-100 h-1.5 md:h-2 rounded-full overflow-hidden">
                    <div class="bg-slate-800 h-full rounded-full transition-all duration-1000" 
                         :style="{ width: Math.min(100, (f.votes.length / Math.max(1, store.totalVoters)) * 100) + '%' }"></div>
                </div>
            </div>
        </div>
    </section>
    
    <section class="card-panel p-5 md:p-8">
        <h3 class="text-base md:text-lg font-black mb-4 md:mb-6 text-slate-800 border-l-4 border-slate-800 pl-3">預算分佈</h3>
        <div class="grid grid-cols-2 gap-3 md:gap-4">
            <div v-for="(voters, budget) in store.budgets" :key="budget" class="p-3 md:p-4 rounded-xl md:rounded-2xl bg-white border border-slate-100 flex justify-between items-center shadow-sm">
                <span class="text-[11px] md:text-xs font-bold text-slate-500">{{ budget }}</span>
                <span class="text-base md:text-lg font-black text-slate-800">{{ voters.length }} 人</span>
            </div>
        </div>
    </section>
  </div>
</template>

<script setup>
import { store } from '../store';
</script>