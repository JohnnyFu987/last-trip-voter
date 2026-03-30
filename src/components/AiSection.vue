<template>
  <div v-show="isVisible" class="mb-8">
    <section class="card-panel p-5 md:p-8 border-2 border-blue-50 bg-white">
        <div class="flex items-center justify-between mb-4 md:mb-6">
            <h3 class="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                <i data-lucide="brain-circuit" class="text-blue-600 w-5 h-5 md:w-6 md:h-6"></i> AI 智慧領隊
            </h3>
            <button @click="isVisible = false" class="text-slate-400 hover:text-slate-600 transition">
                <i data-lucide="x" class="w-5 h-5 md:w-6 md:h-6"></i>
            </button>
        </div>
        
        <div v-if="isLoading" class="flex items-center gap-3 py-4 md:py-6 justify-center">
            <div class="w-5 h-5 md:w-6 md:h-6 border-2 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <span class="text-blue-600 font-bold tracking-widest text-sm md:text-base">整理行程建議中...</span>
        </div>
        
        <div v-else-if="aiContent" class="text-sm md:text-base text-slate-700 font-medium leading-relaxed" v-html="aiContent"></div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { store } from '../store';
import { API_CONFIG } from '../config/api';

const isVisible = ref(false);
const isLoading = ref(false);
const aiContent = ref("");

const fetchAIRecommendation = async () => {
    isVisible.value = true;
    isLoading.value = true;
    aiContent.value = "";
    
    // 組合當前統計資料
    const destData = store.destinations.map(d => `${d.name}(${d.votes.length}票)`).join(', ');
    const userQuery = `目前最新數據：目的地：${destData}。有空日期統計：${Object.entries(store.dates).filter(x=>x[1].length>0).length} 天有交集。`;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                contents: [{ parts: [{ text: userQuery }] }], 
                systemInstruction: { parts: [{ text: "你是一位熱情活潑的畢業旅行領隊。請根據提供的數據，給予學生們一段簡短(150字內)、熱情的推薦建議。" }] } 
            })
        });
        const result = await response.json();
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
            aiContent.value = `<div class="bg-blue-50/60 p-4 md:p-5 rounded-xl border border-blue-100 text-blue-900">${text.replace(/\n/g, '<br>')}</div>`;
        } else {
            throw new Error("API 無回傳");
        }
    } catch (error) {
        aiContent.value = "AI 領隊目前沒錢買Token...";
    } finally {
        isLoading.value = false;
    }
};

// 監聽 NavBar 傳來的事件
onMounted(() => window.addEventListener('open-ai-section', fetchAIRecommendation));
onUnmounted(() => window.removeEventListener('open-ai-section', fetchAIRecommendation));
</script>