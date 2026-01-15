<template>
  <header class="header">
    <div class="header-inner">
      <!-- ĽAVÁ ČASŤ -->
      <nav class="main-nav">
        <router-link to="/" class="nav-link">
          <i class="fa-solid fa-house"></i>
        </router-link>

        <router-link
          v-if="authStore.isAdmin"
          to="/admin"
          class="nav-link"
        >
          <i class="fa-solid fa-user-shield"></i>
        </router-link>
      </nav>

      <!-- STRED -->
      <h1 class="title">Parking</h1>

      <!-- PRAVÁ ČASŤ -->
      <div v-if="authStore.isAuthenticated" class="user-info">
        <span class="email">{{ authStore.user.email }}</span>

        <span class="points">
          <i class="fa-solid fa-star"></i>
          {{ parkingStore.getUserPoints }}
        </span>

        <button class="signout-btn" @click="authStore.signOut">
          <i class="fa-solid fa-power-off"></i>
        </button>
      </div>
    </div>
  </header>

  <main>
    <router-view />
  </main>
</template>


<script setup>
import { watch } from 'vue';
import { useParkingStore } from '@/stores/ParkingStore';
import { useAuthStore } from '@/stores/AuthStore';
import '@/style.css'; // Importing styles.css

const parkingStore = useParkingStore();
const authStore = useAuthStore();

watch(() => authStore.userId, (newUserId) => {
  if (newUserId) {
    parkingStore.fetchUserStatus();
  } else {
    parkingStore.$reset();
  }
}, { immediate: true });
</script>

<style scoped>
.header {
  background-color: var(--primary-color);
  color: #e7dfc6;
  border-bottom: 1px solid #ddd;
}

.header-inner {
  display: flex;
  /* flex-wrap: wrap; */
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 1.5rem;
}

/* NAV */
.main-nav {
  display: flex;
  gap: 0.75rem;
}

.nav-link {
  color: #e7dfc6;
  font-size: 1.2rem;
}

.nav-link i {
  padding: 0.4rem;
}

/* TITLE */
.title {
  flex: 1 1 100%;
  text-align: center;
  margin: 0;
  font-size: 1.4rem;
}

/* USER INFO */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
}

.email {
  display: none; /* skryté na mobile */
}

.points i {
  color: gold;
}

/* BUTTON */
.signout-btn {
  background: none;
  border: none;
  color: #e7dfc6;
  font-size: 1.1rem;
  cursor: pointer;
}

/* ---------- DESKTOP ---------- */
@media (min-width: 768px) {
  .title {
    flex: 0;
  }

  .email {
    display: inline;
  }

  .header-inner {
    flex-wrap: nowrap;
    gap: 7rem;
  }
}

</style>
