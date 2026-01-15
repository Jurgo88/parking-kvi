<template>
  <div class="auth-card">
    <h2>Login Page</h2>
    <p v-if="authStore.authError" class="error-msg">{{ authStore.authError }}</p>
    
    <input type="email" v-model="email" placeholder="Email" required>
    <input type="password" v-model="password" placeholder="Heslo" required>
    
    <button @click="handleSignIn">Login</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/AuthStore';

const authStore = useAuthStore();
const email = ref('');
const password = ref('');

const handleSignIn = () => {
  authStore.signIn(email.value, password.value);
};
</script>
<style scoped>
.auth-card {
  background-color: var(--tertiary-color);
  padding: 20px;
  border-radius: 0px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  margin: auto;
}

.error-msg {
  color: lightcoral;
  font-size: 1.2em;
}

input {
  display: block;
  width: 100%;
  padding: 10px 0px;
  margin: 10px 0px;
  /* padding-left: 10px; */
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}

button {
  background-color: var(--primary-color);
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  width: 100%;
}

</style>