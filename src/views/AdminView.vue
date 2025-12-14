<template>
    <div class="admin-dashboard">
      <h1>Administrátorský Prehľad</h1>
      
      <AdminUserList />
    </div>
  </template>
  
  <script setup>
  import AdminUserList from '@/components/AdminUserList.vue';
  // Možno budeme neskôr kontrolovať, či je užívateľ admin, ale zatiaľ to preskočme.
  </script>
  
  <style scoped>
  .admin-dashboard {
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 8px;
  }
  h1 {
    color: #007bff;
    border-bottom: 3px solid #007bff;
    padding-bottom: 10px;
    margin-bottom: 25px;
  }
  </style>