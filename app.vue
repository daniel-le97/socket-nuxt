<template>
  <div>
    <ClientOnly>
      <div class="center">
        <button @click="router.push( '/' )">Home</button>
        <button @click="router.push( '/interactive' )">Interactive</button>
      </div>
      <NuxtPage />
    </ClientOnly>
  </div>
</template>
<script lang="ts" setup>
import { useRouter } from "#imports";
const router = useRouter();
</script>

<style>
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
}

button:hover {
  background-color: #0056b3;
}
</style>
