<template>
  <div>
    <h1>Vue.js</h1>
    <p>{{ message }}</p>
  </div>
</template>

<script lang="ts" setup>
import * as os from 'socket:os';
const message = useState( 'Hello', () => os.platform() );
</script>
