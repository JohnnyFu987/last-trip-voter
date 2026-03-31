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
    
    // 1. 目的地統計：列出所有有得票的目的地與票數
    const destData = store.destinations
        .filter(d => d.votes.length > 0)
        .map(d => `${d.name}(${d.votes.length}票)`)
        .join('、') || '尚未投票';
        
    // 2. 日期共識：計算有交集的天數
    const intersectedDays = Object.entries(store.dates).filter(x => x[1].length > 0).length;
    
    // 3. 預算統計：找出各預算區間的票數
    const budgetData = Object.entries(store.budgets)
        .filter(([range, voters]) => voters.length > 0)
        .map(([range, voters]) => `${range}(${voters.length}票)`)
        .join('、') || '無特定預算';
        
    // 4. 重視因素統計：找出有被投票的因素與票數
    const prioritiesData = store.factors
        .filter(f => f.votes.length > 0)
        .map(f => `${f.name}(${f.votes.length}票)`)
        .join('、') || '無特別要求';

    // 組合最終提示詞
    const fullPrompt = `你是一位熱情活潑的畢業旅行領隊。請根據提供的最新統計數據，給予學生們一段熱情且具建設性的推薦建議。

最新數據：
- 目的地票選：${destData}
- 預算範圍統計：${budgetData}
- 同學重視因素：${prioritiesData}
- 日期共識：目前有 ${intersectedDays} 天是大家都有空的黃金時段！

要求：
1. 必須針對「預算」與「重視因素」給予具體的行程方向建議（例如省錢玩法、或是該注重吃還是買）。
2. 字數請控制在 150 字以內。
3. 語氣要像學長姊一樣專業又帶動氣氛，請加上一些 Emoji ⚡️🎉 帶動期待感。`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
                contents: [{ 
                    parts: [{ text: fullPrompt }] 
                }]
            })
        });

        const result = await response.json();
        
        if (result.error) {
            console.error("API 錯誤詳情:", result.error);
            throw new Error(result.error.message);
        }

        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (text) {
            aiContent.value = `<div class="bg-blue-50/60 p-4 md:p-5 rounded-xl border border-blue-100 text-blue-900">${text.replace(/\n/g, '<br>')}</div>`;
        } else {
            throw new Error("API 回傳格式異常");
        }
    } catch (error) {
        console.error("Fetch 失敗:", error);
        aiContent.value = "AI 領隊目前連線異常，請稍後再試！";
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => window.addEventListener('open-ai-section', fetchAIRecommendation));
onUnmounted(() => window.removeEventListener('open-ai-section', fetchAIRecommendation));
</script>