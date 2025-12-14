<template>
  <div class="allocation-list">
    <h2>Vaše Aktuálne Žiadosti a Alokácie</h2>

    <p v-if="parkingStore.userRequests.length === 0">Zatiaľ nemáte žiadne podané žiadosti.</p>

    <div v-else>
      <ul class="request-items">
        <li v-for="req in parkingStore.userRequests" :key="req.request_id">
          
          <div class="request-header">
            {{ req.parking_date }} - {{ req.preferred_section }} -

            <span v-if="req.is_cancelled" class="status cancelled">
              ❌ ZRUŠENÁ
            </span>
            <span v-else-if="req.final_status === 'PRIDELENÉ'" class="status success">
              ✅ PRIDELENÉ
            </span>
            <span v-else class="status pending">
              ⏳ {{ req.final_status }}
            </span>
          </div>

          <template v-if="req.final_status === 'PRIDELENÉ' && !req.is_cancelled">
            <div class="allocation-details">
              <AllocationStatus 
                   :allocation="req.allocation" 
                   :parkingDate="req.parking_date" 
              />
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
.allocation-list {
    background-color: white;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.allocation-list h2 {
    margin-top: 0;
    color: #007bff;
    border-bottom: 2px solid #007bff;
    padding-bottom: 10px;
}

.request-items { 
    list-style: none; 
    padding: 0; 
}

.request-items li { 
    border: 1px solid #dee2e6; /* Svetlo sivý okraj */
    padding: 15px; 
    margin-bottom: 10px;
    background: #fff;
    border-radius: 4px;
    transition: box-shadow 0.2s;
}

.request-items li:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.request-header {
    display: flex;
    align-items: center;
}

.status { 
    padding: 4px 8px; /* Väčší padding */
    border-radius: 12px; /* Zaoblenejší badge */
    font-weight: bold; 
    margin-left: 15px;
    font-size: 0.9em;
}

.success { 
    background-color: #d4edda; 
    color: #155724; 
}
.pending { 
    background-color: #fff3cd; 
    color: #856404; 
}
/* PRIDANÝ ŠTÝL PRE ZRUŠENÚ */
.cancelled { 
    background-color: #f8d7da; /* Svetlo červené pozadie */
    color: #721c24; /* Tmavá červená farba textu */
}

.allocation-details { 
    margin-top: 10px; 
    padding-top: 10px; 
    border-top: 1px dashed #ced4da; /* Krajší deliaci riadok */
    padding-left: 5px; /* Trochu odsadenie */
}
</style>