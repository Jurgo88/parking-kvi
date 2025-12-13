<template>
  <div class="allocation-list">
    <h2>Vaše Aktuálne Žiadosti a Alokácie</h2>

    <p v-if="parkingStore.userRequests.length === 0">Zatiaľ nemáte žiadne podané žiadosti.</p>

    <div v-else>
      <ul class="request-items">
        <li v-for="req in parkingStore.userRequests" :key="req.request_id">
          <strong>Dátum: {{ req.parking_date }}</strong> | 
          Preferovaná sekcia: {{ req.preferred_section }}

          <span v-if="req.is_successful" class="status success">
            ✅ PRIDELENÉ
          </span>
          <span v-else class="status pending">
            ⏳ ČAKÁ NA ŽREBOVANIE
          </span>

          <template v-if="req.is_successful">
            <div class="allocation-details">
                <AllocationStatus :requestId="req.request_id" />
            </div>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useParkingStore } from '@/stores/ParkingStore';
import AllocationStatus from '@/components/AllocationStatus.vue'; // Nový podkomponent

const parkingStore = useParkingStore();
</script>

<style scoped>
.request-items { list-style: none; padding: 0; }
.request-items li { 
    border: 1px solid #ccc; 
    padding: 10px; 
    margin-bottom: 10px;
    background: #fff;
}
.status { padding: 2px 5px; border-radius: 3px; font-weight: bold; margin-left: 10px; }
.success { background-color: #d4edda; color: #155724; }
.pending { background-color: #fff3cd; color: #856404; }
.allocation-details { margin-top: 5px; padding-top: 5px; border-top: 1px dashed #eee; }
</style>