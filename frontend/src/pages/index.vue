<template>
  <MyHeader/>
  <LoginForm/>
  <v-footer height="40" app>


<div
  class="text-caption text-disabled"
  style="position: absolute; right: 16px; background-color: black;" 
>
  &copy; 2016-{{ (new Date()).getFullYear() }} <span class="d-none d-sm-inline-block">Homepage</span>
  —
  <a
    class="text-decoration-none on-surface"
    href="https://vuetifyjs.com/about/licensing/"
    rel="noopener noreferrer"
    target="_blank"
  >
    MIT License
  </a>
</div>
</v-footer>
</template>

<script setup>
  //
</script>
