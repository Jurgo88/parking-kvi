<template>
    <div class="allocation-info">
        <div v-if="allocation.spot_number" class="spot-details"> 
            <strong>Spot:</strong> {{ allocation.spot_number }}
            <span v-if="allocation.preferred_section"> ({{ allocation.preferred_section }})</span>
            <!-- <br><br> -->
            
            <!-- <span v-if="allocation.points_change" class="points-change">
                [Points change: {{ allocation.points_change }}]
            </span> -->
        </div>
        <div v-else class="spot-details">
            <strong>Spot:</strong> Allocated, but spot detail is missing
        </div>
        
        <button 
            v-if="!isPastDate && !allocation.is_cancelled" 
            @click="handleCancel" 
            :disabled="isCancelling"
            class="cancel-btn"
        >
            {{ isCancelling ? 'Cancelling...' : 'Cancel' }}
        </button>

        <div v-else-if="allocation.is_cancelled" class="note cancelled">
            ❌ This allocation has been cancelled.
        </div>
        <div v-else class="note">
            ⚠️ Allocation can no longer be cancelled (date has passed).
        </div>
    </div>
</template>



<script setup>
import { defineProps, ref, computed } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';

const props = defineProps({
    // Full allocation object passed from UserAllocations.vue
    allocation: {
        type: Object,
        required: true
    },
    // Parking date passed from UserAllocations.vue (format YYYY-MM-DD)
    parkingDate: {
        type: String,
        required: true
    }
});

const parkingStore = useParkingStore();
const isCancelling = ref(false);

// Computed: checks whether the parking date is already in the past
const isPastDate = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const allocationDate = new Date(props.parkingDate);
    allocationDate.setHours(0, 0, 0, 0);

    return allocationDate < today;
});

const handleCancel = async () => {
    if (confirm('Are you sure you want to cancel this allocation? You will receive priority points. Continue?')) {
        isCancelling.value = true;
        try {
            // Call store action that invokes SQL function 'cancel_allocation'
            await parkingStore.cancelAllocation(props.allocation.allocation_id);
            
            alert('Allocation successfully cancelled and points awarded!');
            // Store should refresh state (e.g. via fetchUserStatus()) after success
            
        } catch (e) {
            alert('Error cancelling allocation: ' + (e.message || e));
        } finally {
            isCancelling.value = false;
        }
    }
};
</script>

<style scoped>
.allocation-info { 
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