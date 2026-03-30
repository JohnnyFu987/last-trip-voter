<template>
  <div v-if="uiState.isModalOpen" class="fixed inset-0 bg-slate-900/40 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-sm transition-opacity">
    <div class="bg-white w-full max-w-sm rounded-[1.5rem] overflow-hidden shadow-2xl">
        <div class="p-6 md:p-8 text-center text-white" :style="{ backgroundColor: uiState.modalData?.color || '#2d3e30' }">
            <h4 class="text-xl md:text-2xl font-bold">{{ uiState.modalData?.name }}</h4>
            <p class="text-xs md:text-sm opacity-90 mt-1 font-bold">{{ uiState.modalData?.votes.length }} 位想去這裡</p>
        </div>
        <div class="p-6 md:p-8">
            <ul class="space-y-2.5 md:space-y-3 max-h-[40vh] overflow-y-auto">
                <li v-for="voter in uiState.modalData?.votes" :key="voter" class="flex items-center gap-2 md:gap-3 text-sm font-bold text-slate-600 bg-slate-50 p-2.5 md:p-3 rounded-xl">
                    <span class="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full shadow-sm"></span> {{ voter }}
                </li>
            </ul>
            <button @click="closeModal" class="mt-6 md:mt-8 w-full py-3 bg-slate-100 rounded-xl font-bold text-sm md:text-base text-slate-600 hover:bg-slate-200 transition">
                關閉
            </button>
        </div>
    </div>
  </div>
</template>

<script setup>
import { uiState } from '../store';

const closeModal = () => {
    uiState.isModalOpen = false;
    setTimeout(() => { uiState.modalData = null; }, 300); // 確保過場動畫順暢
};
</script>