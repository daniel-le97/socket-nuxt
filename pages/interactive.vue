<template>
  <section>
    <div class="container">
      <h1 class="green">Nuxt</h1>
      <p>{{ message }}</p>
      <button @click=" increment ">Increment</button>
      <p>Count: {{ count }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import * as os from "socket:os";
import { useState } from '#imports';
const message = useState( 'Hello', () => os.platform() );
const count = useState( 'counter', () => 0 );

const increment = () => {
  count.value++;
};
</script>

<style scoped>
.green {
  color: green;
}

.container {
  font-family: Arial, sans-serif;
  text-align: center;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
}


p {
  margin: 10px 0;
  font-size: 18px;
}
</style>
