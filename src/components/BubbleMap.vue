<template>
  <section class="space-y-3 md:space-y-4">
    <h2 class="text-xl md:text-2xl font-black text-slate-800 px-1">目的地熱度圖</h2>
    <div ref="containerRef" class="h-[350px] md:h-[500px] relative w-full overflow-hidden bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#edf2f7]">
        <div v-if="isEmpty" class="absolute inset-0 flex items-center justify-center text-slate-400 font-bold">目前還沒有人投票喔！</div>
        <div v-for="(dest, index) in activeDestinations" :key="index"
             :ref="el => { if(el) bubbleRefs[index] = el }"
             class="bubble"
             :style="{ backgroundColor: dest.color, width: getRadius(dest) * 2 + 'px', height: getRadius(dest) * 2 + 'px' }"
             @click="openModal(dest)">
            <div>
                <div class="text-base md:text-lg">{{ dest.name }}</div>
                <div class="text-[10px] md:text-xs opacity-80">{{ dest.votes.length }} 票</div>
            </div>
        </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { store, uiState } from '../store';

const containerRef = ref(null);
const bubbleRefs = ref([]);
let physicsId = null;
let bubblesData = [];

const activeDestinations = computed(() => store.destinations.filter(d => d.votes.length > 0));
const isEmpty = computed(() => activeDestinations.value.length === 0);

// 1. 微調電腦版尺寸：稍微縮小電腦版比例，確保畫面高度 (500px) 有足夠空間容納
const getRadius = (dest) => {
    const isMobile = window.innerWidth < 768;
    const baseRadius = isMobile ? 25 : 35;       // 電腦版從 45 微調至 35
    const voteMultiplier = isMobile ? 6 : 10;    // 電腦版每票增加的幅度從 15 微調至 10
    const maxRadius = isMobile ? 70 : 100;       // 電腦版最大半徑設為 100
    
    return Math.min(baseRadius + (dest.votes.length * voteMultiplier), maxRadius);
};

const openModal = (dest) => {
    uiState.modalData = dest;
    uiState.isModalOpen = true;
};

const initPhysics = () => {
    if (physicsId) cancelAnimationFrame(physicsId);
    if (!containerRef.value || isEmpty.value) return;

    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;

    bubblesData = activeDestinations.value.map((dest, i) => {
        const radius = getRadius(dest);
        const votes = dest.votes.length;
        return {
            x: Math.random() * Math.max(0, width - radius * 2) + radius,
            y: Math.random() * Math.max(0, height - radius * 2) + radius,
            vx: 0, vy: 0, radius, elIndex: i, votes
        };
    });

    const update = () => {
        const cx = width / 2, cy = height / 2;
        bubblesData.forEach((b, i) => {
            b.vx += (Math.random() - 0.5) * 0.4;
            b.vy += (Math.random() - 0.5) * 0.4;
            
            // 2. 減弱向心力：讓泡泡往中間靠的力量變得更溫和
            const basePull = 0.0002; 
            const votePull = b.votes * 0.0004; 
            const pullStrength = basePull + votePull;
            
            b.vx += (cx - b.x) * pullStrength; 
            b.vy += (cy - b.y) * pullStrength;
            
            // 稍微增加一點摩擦力，讓畫面更穩定不躁動
            b.vx *= 0.92; 
            b.vy *= 0.92;
            
            // 3. 核心修改：大幅增強碰撞排斥力 (Push)
            for (let j = i + 1; j < bubblesData.length; j++) {
                let b2 = bubblesData[j], dx = b2.x - b.x, dy = b2.y - b.y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let minDist = b.radius + b2.radius + 12; // 增加 12px 的安全距離，讓泡泡間有間隙
                
                if (dist < minDist) {
                    let angle = Math.atan2(dy, dx);
                    let push = (minDist - dist) * 0.25; // 排斥力從 0.05 提升到 0.25，讓泡泡變「硬」不重疊
                    b.vx -= Math.cos(angle) * push; b.vy -= Math.sin(angle) * push;
                    b2.vx += Math.cos(angle) * push; b2.vy += Math.sin(angle) * push;
                }
            }
            b.x += b.vx; b.y += b.vy;
            
            // 邊界反彈
            if (b.x - b.radius < 0) { b.x = b.radius; b.vx *= -0.5; }
            if (b.x + b.radius > width) { b.x = width - b.radius; b.vx *= -0.5; }
            if (b.y - b.radius < 0) { b.y = b.radius; b.vy *= -0.5; }
            if (b.y + b.radius > height) { b.y = height - b.radius; b.vy *= -0.5; }

            const el = bubbleRefs.value[b.elIndex];
            if (el) el.style.transform = `translate(${b.x - b.radius}px, ${b.y - b.radius}px)`;
        });
        physicsId = requestAnimationFrame(update);
    };
    update();
};

watch(activeDestinations, () => {
    setTimeout(initPhysics, 100);
}, { deep: true });

onMounted(() => {
    setTimeout(initPhysics, 100);
    window.addEventListener('resize', initPhysics);
});

onUnmounted(() => { 
    if (physicsId) cancelAnimationFrame(physicsId); 
    window.removeEventListener('resize', initPhysics);
});
</script>