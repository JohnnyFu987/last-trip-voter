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

const getRadius = (dest) => {
    const baseRadius = window.innerWidth < 768 ? 40 : 50;
    return baseRadius + (dest.votes.length * 15);
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
        return {
            x: Math.random() * Math.max(0, width - radius * 2) + radius,
            y: Math.random() * Math.max(0, height - radius * 2) + radius,
            vx: 0, vy: 0, radius, elIndex: i
        };
    });

    const update = () => {
        const cx = width / 2, cy = height / 2;
        bubblesData.forEach((b, i) => {
            b.vx += (Math.random() - 0.5) * 0.6;
            b.vy += (Math.random() - 0.5) * 0.6;
            b.vx += (cx - b.x) * 0.003; 
            b.vy += (cy - b.y) * 0.003;
            b.vx *= 0.95; b.vy *= 0.95;
            
            for (let j = i + 1; j < bubblesData.length; j++) {
                let b2 = bubblesData[j], dx = b2.x - b.x, dy = b2.y - b.y;
                let dist = Math.sqrt(dx*dx + dy*dy), minDist = b.radius + b2.radius + 8;
                if (dist < minDist) {
                    let angle = Math.atan2(dy, dx), push = (minDist - dist) * 0.08;
                    b.vx -= Math.cos(angle) * push; b.vy -= Math.sin(angle) * push;
                    b2.vx += Math.cos(angle) * push; b2.vy += Math.sin(angle) * push;
                }
            }
            b.x += b.vx; b.y += b.vy;
            
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

onMounted(() => setTimeout(initPhysics, 100));
onUnmounted(() => { if (physicsId) cancelAnimationFrame(physicsId); });
</script>