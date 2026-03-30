<template>
  <div>
    <div v-if="uiState.isLoading" class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
        <div class="w-10 h-10 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4"></div>
        <p class="font-bold text-slate-600 tracking-widest text-sm md:text-base">{{ uiState.loadingText }}</p>
    </div>

    <Transition name="login-fade">
      <LoginScreen v-if="!uiState.isLoggedIn" />
    </Transition>

    <div v-if="uiState.isLoggedIn" class="min-h-screen pb-16 md:pb-20">
      <NavBar />
      <main class="max-w-6xl mx-auto px-4 md:px-6 mt-6 md:mt-10 space-y-8 md:space-y-12">
        <AiSection />
        <BubbleMap />
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          <div class="space-y-8 md:space-y-10">
            <StatsPanel />
            <CalendarPanel />
          </div>
          <VotingForm />
        </div>
      </main>
    </div>

    <VoterModal />
  </div>
</template>

<script setup>
import { onMounted, onUpdated } from 'vue';
import { uiState, apiService } from './store';
import LoginScreen from './components/LoginScreen.vue';
import NavBar from './components/NavBar.vue';
import AiSection from './components/AiSection.vue';
import BubbleMap from './components/BubbleMap.vue';
import StatsPanel from './components/StatsPanel.vue';
import CalendarPanel from './components/CalendarPanel.vue';
import VotingForm from './components/VotingForm.vue';
import VoterModal from './components/VoterModal.vue';

onMounted(() => {
    apiService.fetchInitialData();
});

// 保留 Lucide CDN 的圖示渲染能力
onUpdated(() => {
    if (window.lucide) window.lucide.createIcons();
});
</script>