<script setup lang="ts">
import { useGroovebox } from '@/composables/useGroovebox.ts'
import BpmCalculator from '@/components/BpmCalculator.vue'
import Groovebox from '@/components/Groovebox/Groovebox.vue'
</script>

<template>
  <div>
    <Groovebox />
    <BpmCalculator />
  </div>
</template>
