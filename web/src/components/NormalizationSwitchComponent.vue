<template>
  <div class="flex justify-end">
    <label
      class="group relative flex items-center p-1 space-x-4 bg-slate-800 border border-slate-700/50 rounded-full shadow-inner cursor-pointer select-none transition-colors duration-300"
      :class="{ 'border-blue-500/20 bg-slate-800/50': ignoreOutliers }"
    >
      <div
        class="pointer-events-none absolute bottom-full right-0 mb-3 z-10 w-48 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 ease-out bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2.5 shadow-xl"
      >
        Activa para ignorar valores atípicos en el análisis usando desviación estándar.
        <div class="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900"></div>
      </div>
      <span
        class="ml-3 text-sm font-medium transition-colors duration-300"
        :class="{
          'text-white': ignoreOutliers,
          'text-slate-400': !ignoreOutliers,
        }"
      >
        Normalizar
      </span>

      <div class="relative">
        <input
          type="checkbox"
          v-model="ignoreOutliers"
          @change="$emit('change', ignoreOutliers)"
          class="sr-only peer"
        />

        <div
          class="w-11 h-6 rounded-full transition-all duration-300 ease-in-out border shadow-inner"
          :class="{
            'bg-blue-600 border-blue-500': ignoreOutliers,
            'bg-slate-700 border-slate-600': !ignoreOutliers,
          }"
        ></div>

        <div
          class="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform duration-300 ease-in-out"
          :class="{ 'translate-x-5': ignoreOutliers }"
        ></div>
      </div>
    </label>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'

defineEmits(['change'])

const ignoreOutliers = ref(false)
</script>
