<template>
  <div class="allocation-list">
    <h2>Your actual allocations</h2>

    <p v-if="parkingStore.userRequests.length === 0">
      Zatiaľ nemáte žiadne podané žiadosti.
    </p>

    <div
      v-for="req in parkingStore.userRequests"
      :key="req.request_id"
      class="request-container"
    >
      <!-- Hlavný riadok: dátum + sekcia | status + tlačidlo -->
      <div class="request-row">
        <div class="request-info">
          <span class="date">{{ req.parking_date }}</span>
          <span class="section">{{ req.preferred_section }}</span>
        </div>

        <div class="request-right">
          <span
            v-if="req.is_cancelled"
            class="status cancelled"
          >❌ CANCELED</span>

          <span
            v-else-if="req.final_status === 'PRIDELENÉ'"
            class="status success"
          >✅ ALLOCATED</span>

          <span v-else class="status pending">⏳ PENDING</span>

          <button
            v-if="!req.is_cancelled && req.final_status !== 'PRIDELENÉ'"
            class="cancel-btn"
            @click="handleCancelRequest(req.request_id)"
          >
            Cancel
          </button>

          <!-- <button v-else class="disabled-btn" disabled>Allocated</button> -->
        </div>
      </div>

      <!-- Detail pre allocated -->
      <div
        v-if="req.final_status === 'PRIDELENÉ' && !req.is_cancelled"
        class="allocation-details"
      >
        <AllocationStatus
          :allocation="req.allocation"
          :parkingDate="req.parking_date"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useParkingStore } from '@/stores/ParkingStore'
import AllocationStatus from '@/components/AllocationStatus.vue'

const parkingStore = useParkingStore()

const handleCancelRequest = async (requestId) => {
  if (!confirm('Are you sure you want to cancel this request?')) return

  try {
    await parkingStore.cancelRequest(requestId)
    alert('Your request has been cancelled.')
  } catch (error) {
    console.error(error)
    alert('There was an error cancelling your request.')
  } finally {
    await parkingStore.fetchUserRequests()
  }
}
</script>

<style scoped>
.allocation-list {
  background-color: #fff;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.allocation-list h2 {
  margin-top: 0;
  margin-bottom: 16px;
  color: var(--primary-color);
  border-bottom: 2px solid var(--primary-color);
  padding-bottom: 8px;
}

/* Hlavný kontajner requestu */
.request-container {
  margin-bottom: 12px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
}

/* Hlavný riadok: dátum + sekcia | status + button */
.request-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  gap: 16px;
  flex-wrap: nowrap;
  overflow-x: auto; /* ak sa nezmestí, scroll */
}

/* LEFT INFO */
.request-info {
  display: flex;
  gap: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
}

/* RIGHT STATUS + BUTTON */
.request-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  white-space: nowrap;
}

/* STATUS */
.status {
  padding: 3px 8px;
  font-size: 0.8rem;
  font-weight: bold;
  border-radius: 4px;
}

.success {
  background-color: #d4edda;
  color: #155724;
}

.pending {
  background-color: #fff3cd;
  color: #856404;
}

.cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

/* BUTTONS */
.cancel-btn {
  padding: 5px 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
}

.disabled-btn {
  padding: 5px 10px;
  border: none;
  border-radius: 4px;
  opacity: 0.5;
  font-size: 0.85rem;
}

/* DETAIL pre allocated */
.allocation-details {
  padding: 6px 10px;
  border-top: 1px dashed #ced4da;
  background-color: #f9f9f9;
}
</style>
