<template>
  <div v-if="selectedClub?.id">
    <div class="my-6 flex flex-col items-center justify-end gap-4 sm:flex-row">
      <NormalizationSwitchComponent @change="ignoreOutliers = $event" />
    </div>

    <div class="mx-auto rounded-xl bg-slate-900 p-6 font-sans shadow-xl border border-slate-800 text-slate-100">
      <div class="mb-6 text-center">
        <h2 class="m-0 text-xl font-bold tracking-tight text-slate-100">Tendencias de Velocidade Anuales</h2>
        <p class="mt-1 text-sm text-slate-400">Mediana, cuartiles (Q1/Q3), rangos y valores atípicos</p>
      </div>

      <div class="relative h-200 w-full">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>
  </div>

  <div
    v-else
    class="my-6 flex min-h-[380px] w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/60 p-8 text-center shadow-xl backdrop-blur-sm"
  >
    <div
      class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
    >
      <svg class="h-8 w-8" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
    </div>
    <h3 class="text-lg font-semibold text-slate-200">Sin club seleccionado</h3>
    <p class="mt-1.5 max-w-sm text-sm text-slate-400">
      Utiliza el buscador de arriba para seleccionar un club y consultar sus estadísticas y tendencias de velocidad
      anuales.
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'
import { storeToRefs } from 'pinia'
import { useSpeedsStore } from '@/stores/speeds'
import { BoxAndWiskers, BoxPlotController } from '@sgratzl/chartjs-chart-boxplot'
import NormalizationSwitchComponent from '@/components/NormalizationSwitchComponent.vue'
import { useClubsStore } from '@/stores/clubs'

Chart.register(...registerables, BoxPlotController, BoxAndWiskers)

const speedsStore = useSpeedsStore()
const { yearAverages } = storeToRefs(speedsStore)
const { selectedClub, selectedGender, selectedCategory } = storeToRefs(useClubsStore())

const minSpeed = computed(() => Math.floor(Math.min(...Object.values(yearAverages.value).flat())))
const maxSpeed = computed(() => Math.ceil(Math.max(...Object.values(yearAverages.value).flat())))
const chartData = computed(() => ({
  labels: Object.keys(yearAverages.value),
  datasets: Object.values(yearAverages.value),
}))

const ignoreOutliers = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

onMounted(async () => {
  await loadData()
  renderChart()
})
watch(yearAverages, () => renderChart(), { deep: true })
watch(selectedClub, async () => await loadData(), { deep: true })
watch(selectedGender, async () => await loadData(), { deep: true })
watch(selectedCategory, async () => await loadData(), { deep: true })
watch(ignoreOutliers, async () => await loadData(), { deep: true })

async function loadData() {
  await speedsStore.fetchYearAveragesByClub(
    selectedClub.value,
    selectedGender.value,
    selectedCategory.value,
    ignoreOutliers.value,
  )
}

function renderChart() {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const config: ChartConfiguration<'boxplot'> = {
    type: 'boxplot',
    data: {
      labels: chartData.value.labels,
      datasets: [
        {
          label: 'Distribución',
          data: chartData.value.datasets,
          backgroundColor: 'rgba(59, 130, 246, 0.25)',
          borderColor: '#2563EB',
          borderWidth: 1.5,
          outlierBackgroundColor: '#EF4444',
          outlierRadius: 4,
          itemRadius: 0,
          meanBackgroundColor: '#F59E0B',
          meanRadius: 3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          position: 'nearest',
        },
      },
      scales: {
        y: {
          min: minSpeed.value,
          max: maxSpeed.value,
          title: {
            display: true,
            text: 'Velocidades (km/h)',
            font: { weight: 'bold', size: 12 },
          },
          grid: { color: 'rgba(0, 0, 0, 0.05)' },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  }

  chartInstance = new Chart(ctx, config)
}

onBeforeUnmount(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>
