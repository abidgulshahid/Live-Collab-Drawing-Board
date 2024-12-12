<template>
  <v-footer app class="px-4 py-2">
    <v-row no-gutters align="center" justify="space-between">
      <!-- Left side: Copyright -->
      <v-col cols="auto">
        <span class="text-caption text-medium-emphasis">
          &copy; {{ (new Date()).getFullYear() }} 
          <span class="d-none d-sm-inline">Live Drawing Tool</span>
        </span>
      </v-col>

      <!-- Right side: Links -->
      <v-col cols="auto">
        <v-row no-gutters align="center" class="gap-x-4">
          <a
            href="https://vuetifyjs.com/about/licensing/"
            class="text-caption text-decoration-none text-medium-emphasis"
            rel="noopener noreferrer"
            target="_blank"
          >
            MIT License
          </a>
          <!-- Add more links as needed -->
        </v-row>
      </v-col>
    </v-row>
  </v-footer>
</template>

