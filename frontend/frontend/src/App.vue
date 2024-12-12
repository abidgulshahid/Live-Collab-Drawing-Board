<template>
  <v-app>
    <MyHeader/>
    <AppFooter/>

    <v-main class="bg-white">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
// No additional setup logic required for now.
</script>

<style scoped>
/* Add global styles if necessary */
</style>