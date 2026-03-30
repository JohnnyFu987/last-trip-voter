import { reactive, ref } from 'vue';
import { API_CONFIG, BUBBLE_COLORS } from './config/api';

export const store = reactive({
    currentUser: "",
    destinations: [],
    factors: [
        { name: "美食", votes: [], icon: "utensils" },
        { name: "好買", votes: [], icon: "shopping-bag" },
        { name: "天氣", votes: [], icon: "sun" },
        { name: "景觀", votes: [], icon: "camera" }
    ],
    budgets: { "1萬以內": [], "1-2萬": [], "2-3萬": [], "3萬以上": [] },
    dates: {}, 
    rawVotes: [], 
    totalVoters: 0,
    selectedDates: [],
    currentCalYear: 2026,
    currentCalMonth: 5,
    usersList: []
});

export const uiState = reactive({
    isLoading: true,
    loadingText: "正在載入成員清單...",
    isLoggedIn: false,
    modalData: null,
    isModalOpen: false
});

export const apiService = {
    async fetchInitialData() {
        uiState.isLoading = true;
        uiState.loadingText = "正在載入成員名單與投票資料...";
        try {
            const response = await fetch(API_CONFIG.GAS_URL);
            const data = await response.json();
            if (data.result === "error") throw new Error(data.error);
            
            store.usersList = data.users || [];
            if (data.votes && data.votes.length > 1) {
                store.rawVotes = data.votes.slice(1);
                this.parseSheetData(store.rawVotes);
            } else {
                this.setDefaultDestinations();
            }
        } catch (error) {
            alert("載入失敗: " + error.message);
        } finally {
            uiState.isLoading = false;
        }
    },
    setDefaultDestinations() {
        store.destinations = ["京都", "清邁", "首爾", "冰島", "台灣"].map((d, i) => ({
            name: d, votes: [], color: BUBBLE_COLORS[i % BUBBLE_COLORS.length]
        }));
    },
    parseSheetData(rows) {
        store.destinations = [];
        store.factors.forEach(f => f.votes = []);
        Object.keys(store.budgets).forEach(k => store.budgets[k] = []);
        store.dates = {};
        this.setDefaultDestinations();

        let uniqueVoters = new Set();
        rows.forEach(row => {
            const [_, name, destStr, budget, factorsStr, datesStr] = row;
            if(name) uniqueVoters.add(name);
            
            (destStr ? destStr.toString().split(', ') : []).forEach(dest => {
                if (!dest) return;
                let dObj = store.destinations.find(d => d.name === dest);
                if(!dObj) {
                    dObj = { name: dest, votes: [], color: BUBBLE_COLORS[store.destinations.length % BUBBLE_COLORS.length] };
                    store.destinations.push(dObj);
                }
                if(!dObj.votes.includes(name)) dObj.votes.push(name);
            });
            
            if(name && budget && store.budgets[budget] && !store.budgets[budget].includes(name)) {
                store.budgets[budget].push(name);
            }
            
            (factorsStr ? factorsStr.toString().split(', ') : []).forEach(fName => {
                if (!fName) return;
                let fObj = store.factors.find(f => f.name === fName);
                if(!fObj) { fObj = { name: fName, votes: [], icon: "check" }; store.factors.push(fObj); }
                if(!fObj.votes.includes(name)) fObj.votes.push(name);
            });

            (datesStr ? datesStr.toString().split(', ') : []).forEach(dStr => {
                if (!dStr) return;
                if (!store.dates[dStr]) store.dates[dStr] = [];
                if (!store.dates[dStr].includes(name)) store.dates[dStr].push(name);
            });
        });
        store.totalVoters = uniqueVoters.size || 1;
    }
};