<template>
  <div>
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'
import { storeToRefs } from 'pinia'
import { useSpeedsStore } from '@/stores/speeds'
import { BoxAndWiskers, BoxPlotController } from '@sgratzl/chartjs-chart-boxplot'
import { useLeaguesStore } from '@/stores/leagues'
import NormalizationSwitchComponent from '@/components/NormalizationSwitchComponent.vue'

Chart.register(...registerables, BoxPlotController, BoxAndWiskers)

const speedsStore = useSpeedsStore()
const { yearAverages } = storeToRefs(speedsStore)
const { selectedLeague } = storeToRefs(useLeaguesStore())

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
watch(selectedLeague, async () => await loadData(), { deep: true })
watch(ignoreOutliers, async () => await loadData(), { deep: true })

async function loadData() {
  await speedsStore.fetchYearAverages(selectedLeague.value, ignoreOutliers.value)
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
