<template>
    <nav class="sidebar">
      <RouterLink to="/admin">📊 Dashboard</RouterLink>
      <RouterLink to="/admin/users">👤 Users</RouterLink>
      <RouterLink to="/admin/requests">📝 Requests</RouterLink>
      <RouterLink to="/admin/allocations">🚗 Allocations</RouterLink>
      <RouterLink to="/admin/parking">🚙 Parking Spots</RouterLink>
      <RouterLink to="/admin/stats">📈 Statistics</RouterLink>
      <RouterLink to="/admin/settings">⚙️ Settings</RouterLink>
    </nav>
</template>

<script setup>

</script>
<style scoped>
.sidebar {
  padding: 20px;
  display: flex;
  flex-direction: row;
  gap: 15px;
  background-color: #f8f9fa; /* Added a light background color */
}

.sidebar a {
  text-decoration: none; /* Ensure links have no underline */
  color: #333; /* Set a default text color */
}

.sidebar a:hover {
  color: #007bff; /* Change color on hover */
}
.sidebar a:active {
  color: #0056b3; /* Darker color when the link is active */
}
</style>
  