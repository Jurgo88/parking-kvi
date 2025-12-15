<template>
    <div class="user-list-container">
      <h2>Správa Používateľov a Bodov</h2>
  
      <p v-if="parkingStore.isLoading">Načítavam používateľov...</p>
      <p v-else-if="parkingStore.error" class="error-message">Chyba: {{ parkingStore.error }}</p>
      
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>Meno/Email</th>
            <th>Prioritné Body</th>
            <th>Posledná Aktivita</th>
            <th>Akcie</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in parkingStore.adminUsers" :key="user.user_id">
            <td>{{ user.email }}</td>
            <td class="points-col">{{ user.priority_points }}</td>
            <td>{{ user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'N/A' }}</td>
            <td>
              <button class="btn-edit" @click="editPoints(user)">Upraviť Body</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { useParkingStore } from '@/stores/ParkingStore';
  import { onMounted } from 'vue';
  // Načítame Parking Store
  const parkingStore = useParkingStore();
  
  onMounted(() => {
    // Načítanie dát používateľov pri inicializácii komponentu
    parkingStore.fetchAdminUsers(); 
  });
  
  const editPoints = (user) => {
    alert(`Chcete upraviť body pre ${user.email}. (Implementácia v ďalšom kroku)`);
    // Logika úpravy príde neskôr
  };
  </script>
  
  <style scoped>
  .user-list-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
  .user-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
  }
  .user-table th, .user-table td {
    border: 1px solid #ddd;
    padding: 12px;
    text-align: left;
  }
  .user-table th {
    background-color: #e9ecef;
    color: #333;
  }
  .user-table tr:nth-child(even) {
    background-color: #f8f8f8;
  }
  .points-col {
    font-weight: bold;
    color: #28a745; /* Zelená farba pre body */
  }
  .btn-edit {
    background-color: #ffc107;
    color: #333;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  .btn-edit:hover {
    background-color: #e0a800;
  }
  .error-message {
      color: red;
      font-weight: bold;
  }
  </style>