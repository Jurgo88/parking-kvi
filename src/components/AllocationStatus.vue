<template>
    <div class="allocation-info">
        <div v-if="allocation.spot_number" class="spot-details"> 
            <strong>Miesto:</strong> {{ allocation.spot_number }}
            <span v-if="allocation.preferred_section"> ({{ allocation.preferred_section }})</span>
            
            <span v-if="allocation.points_change" class="points-change">
                [Zmena bodov: {{ allocation.points_change }}]
            </span>
        </div>
        <div v-else class="spot-details">
            <strong>Miesto:</strong> Získané, ale chyba v detaile miesta
        </div>
        
        <button 
            v-if="!isPastDate && !allocation.is_cancelled" 
            @click="handleCancel" 
            :disabled="isCancelling"
            class="cancel-btn"
        >
            {{ isCancelling ? 'Zrušenie...' : 'Zrušiť alokáciu' }}
        </button>

        <div v-else-if="allocation.is_cancelled" class="note cancelled">
            ❌ Táto alokácia bola zrušená.
        </div>
        <div v-else class="note">
            ⚠️ Alokáciu už nie je možné zrušiť (dátum prešiel).
        </div>
    </div>
</template>



<script setup>
import { defineProps, ref, computed } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';

const props = defineProps({
    // Celý objekt alokácie, ktorý posielame z UserAllocations.vue
    allocation: {
        type: Object,
        required: true
    },
    // Dátum parkovania, ktorý posielame z UserAllocations.vue
    parkingDate: {
        type: String, // Očakávame formát YYYY-MM-DD
        required: true
    }
});

const parkingStore = useParkingStore();
const isCancelling = ref(false);

// Vypočítaná vlastnosť: Skontroluje, či je dátum parkovania už v minulosti
const isPastDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const allocationDate = new Date(props.parkingDate);
    allocationDate.setHours(0, 0, 0, 0);

    return allocationDate < today;
});

const handleCancel = async () => {
    if (confirm('Naozaj chcete zrušiť túto alokáciu? Získate prioritné body. Pokračovať?')) {
        isCancelling.value = true;
        try {
            // Volanie akcie v Store, ktorá volá SQL funkciu 'cancel_allocation'
            await parkingStore.cancelAllocation(props.allocation.allocation_id);
            
            alert('Alokácia bola úspešne zrušená a body pripísané!');
            // Store po úspechu automaticky obnoví stav cez fetchUserStatus()
            
        } catch (e) {
            alert('Chyba pri zrušení alokácie: ' + e.message);
        } finally {
            isCancelling.value = false;
        }
    }
};
</script>

<style scoped>
.allocation-info { 
    /* margin-top: 5px;  */
    /* padding: 5px;  */
    /* ... zachovanie vašich štýlov ... */
    /* border-top: 1px dashed #eee;  */
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.cancel-btn {
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9em;
}
.cancel-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}
.note {
    color: #6c757d;
    font-size: 0.85em;
}
</style>