<template>
  <div>
    <NuxtWelcome />
  </div>
</template>

<script lang="ts" setup>
import * as application from 'socket:application';
const app = await application.getCurrentWindow();

function registerLinks () {
  document.querySelectorAll( 'a' ).forEach( ( a ) => {
    a.addEventListener( 'click', async ( e ) => {
      e.preventDefault();
      await app.openExternal( a.href as unknown as Record<string, any> );
    } );
  } );
}
onMounted( () => {
  registerLinks();
} )

</script>

<style></style>
