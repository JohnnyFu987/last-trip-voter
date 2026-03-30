<template>
  <nav class="px-4 md:px-12 py-4 md:py-6 flex justify-between items-center sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-100 shadow-sm">
    <div class="flex items-center gap-2 md:gap-3">
        <span class="serif text-lg md:text-xl font-black text-slate-800 tracking-tight">最後的青春，我們一起決定</span>
    </div>
    <div class="flex items-center gap-3 md:gap-4">
        <button @click="triggerAI" class="flex items-center gap-1.5 md:gap-2 text-blue-700 font-bold text-xs md:text-sm bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full hover:bg-blue-100 transition shadow-sm border border-blue-100">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 md:w-4 md:h-4"></i> AI 推薦
        </button>
        <div class="h-4 w-[1px] bg-slate-200"></div>
        <span class="text-xs md:text-sm font-bold text-slate-600 hidden sm:block">你好，{{ store.currentUser }}</span>
        <button @click="logout" class="text-slate-400 hover:text-red-500 transition">
            <i data-lucide="log-out" class="w-4 h-4 md:w-5 md:h-5"></i>
        </button>
    </div>
  </nav>
</template>

<script setup>
import { store } from '../store';

const triggerAI = () => {
    // 1. 讓畫面平滑滾動到網頁最上方
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
    
    // 2. 觸發自定義事件呼叫 AI 面板
    window.dispatchEvent(new CustomEvent('open-ai-section'));
};

const logout = () => location.reload();
</script>