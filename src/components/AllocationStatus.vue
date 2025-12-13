<template>
    <div v-if="allocation">
        <p>Miesto: <strong>{{ allocation.section_allocated }}</strong></p>
        <p v-if="allocation.is_cancelled" style="color: red;">ZRUŠENÉ: Body {{ allocation.points_change > 0 ? 'vrátené' : 'stratené' }}</p>

        <button 
            v-else 
            @click="handleCancellation(allocation.allocation_id)"
            :disabled="parkingStore.isLoading"
            class="cancel-btn"
        >
            Zrušiť rezerváciu
        </button>
    </div>
    <div v-else>
        <p>Alokácia čaká na potvrdenie.</p>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';

const props = defineProps({
    requestId: Number
});

const parkingStore = useParkingStore();

// Filrujeme alokácie priamo zo Store (ideálne by sme to robili v Getters)
const allocation = computed(() => 
    parkingStore.userRequests.find(r => r.request_id === props.requestId)
);

const handleCancellation = async (allocationId) => {
    if (confirm("Naozaj chcete zrušiť rezerváciu? V závislosti od času Vám nemusia byť vrátené Prioritné Body.")) {
        await parkingStore.cancelAllocation(allocationId);
    }
};
</script>

<style scoped>
.cancel-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 5px;
    cursor: pointer;
}
</style>