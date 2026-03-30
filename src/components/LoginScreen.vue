<template>
  <div class="fixed inset-0 bg-[#f9f9f6] z-100 flex items-center justify-center">
    <div class="max-w-md w-full px-6 md:px-8 flex flex-col items-center">
      <div class="mb-10 text-center">
        <h1 class="serif text-3xl md:text-4xl text-slate-800 tracking-widest leading-none">最後的青春</h1>
        <h1 class="serif text-3xl md:text-4xl text-slate-800 tracking-widest leading-none mt-3 md:mt-4">我們一起決定</h1>
        <div class="w-12 md:w-16 h-0.5 bg-slate-800 mx-auto mt-6 md:mt-8 opacity-60"></div>
      </div>
      <div class="w-full space-y-5 md:space-y-6">
        <div class="px-2">
          <label class="text-xs md:text-sm font-bold text-slate-400 mb-2 block tracking-widest text-center uppercase">你是哪位夥伴？</label>
          <select v-model="selectedUser" 
                  class="w-full p-3.5 md:p-4 rounded-xl md:rounded-2xl outline-none cursor-pointer 
                         text-center appearance-none bg-white shadow-sm text-base md:text-lg">
              <option disabled value="" class="text-center">請選擇你的姓名</option>
              <option v-for="user in store.usersList" 
                      :key="user" 
                      :value="user" 
                      class="text-center"> {{ user }}
              </option>
          </select>
        </div>
        <button @click="login" :disabled="!selectedUser" class="btn-primary w-full py-4 md:py-5 rounded-xl font-bold tracking-widest">
          進入投票系統
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { store, uiState } from '../store';

const selectedUser = ref('');

const login = () => {
    store.currentUser = selectedUser.value;
    const vote = store.rawVotes.find(v => v[1] === store.currentUser);
    if (vote) {
        store.selectedDates = vote[5] ? vote[5].toString().split(', ') : [];
    }
    uiState.isLoggedIn = true;
};
</script>