<template>
  <div>
    <div class="my-6 flex flex-col items-center justify-end gap-4 sm:flex-row">
      <div class="flex items-center space-x-3">
        <label for="number-select" class="text-sm font-medium text-slate-400">Posición:</label>
        <div class="relative">
          <select
            id="number-select"
            v-if="maxParticipants > 1"
            v-model="selectedPosition"
            class="appearance-none rounded-lg border border-slate-700/50 bg-slate-800 py-2 pl-4 pr-10 text-sm text-slate-200 transition-colors duration-200 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option v-for="n in maxParticipants" :key="n" :value="n" class="bg-slate-800 text-slate-200">
              {{ n }}
            </option>
          </select>

          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <NormalizationSwitchComponent @change="ignoreOutliers = $event" />
    </div>

    <div class="mx-auto rounded-xl border border-slate-800 bg-slate-900 p-6 font-sans text-slate-100 shadow-xl">
      <div class="mb-6 text-center">
        <h2 class="m-0 text-xl font-bold tracking-tight text-slate-100">Velocidades por Regata</h2>
        <p class="mt-1 text-sm text-slate-400">Compara las velocidades del ganador por cada año.</p>
      </div>

      <div class="mb-6 flex flex-wrap justify-center gap-3">
        <label v-for="year in availableYears" :key="year" class="flex cursor-pointer items-center space-x-2 text-sm">
          <input
            type="checkbox"
            :value="year"
            v-model="selectedYears"
            class="form-checkbox rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
          />
          <span class="text-slate-300">{{ year }}</span>
        </label>
      </div>

      <div class="relative h-200 w-full">
        <canvas ref="canvasRef"></canvas>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Chart, registerables, type ChartConfiguration } from 'chart.js'
import { storeToRefs } from 'pinia'
import { useSpeedsStore } from '@/stores/speeds'
import { useLeaguesStore } from '@/stores/leagues'
import NormalizationSwitchComponent from '@/components/NormalizationSwitchComponent.vue'

Chart.register(...registerables)

const speedsStore = useSpeedsStore()
const { yearNthSpeeds } = storeToRefs(speedsStore)
const { selectedLeague } = storeToRefs(useLeaguesStore())

const selectedYears = ref<number[]>([])
const availableYears = computed(() => Object.keys(yearNthSpeeds.value).sort())
const speeds = computed(() => {
  const acc: Record<number, number[]> = {}
  for (const year of selectedYears.value) {
    acc[year] = yearNthSpeeds.value[year]!
  }
  return acc
})

const maxParticipants = computed(() =>
  Math.max(...selectedYears.value.map((y) => selectedLeague.value.participants[y] || 0)),
)

const minSpeed = computed(() => Math.floor(Math.min(...Object.values(speeds.value).flat())))
const maxSpeed = computed(() => Math.ceil(Math.max(...Object.values(speeds.value).flat())))

const chartData = computed(() => {
  const maxRegattas = Object.values(speeds.value).reduce((max, speeds) => Math.max(max, speeds.length), 0)

  const labels = Array.from({ length: maxRegattas }, (_, i) => `R${i + 1}`)

  const datasets = [...selectedYears.value].sort().map((year, index) => {
    const color = COLORS[index % COLORS.length]
    return {
      label: `${year}`,
      data: yearNthSpeeds.value[year] || [],
      backgroundColor: color,
      borderColor: color,
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 6,
    }
  })

  return { labels, datasets }
})

const selectedPosition = ref<number>(1)
const ignoreOutliers = ref(false)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const COLORS = [
  '#3B82F6',
  '#EF4444',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#F97316',
  '#14B8A6',
  '#6366F1',
]

onMounted(async () => {
  await loadData()
  renderChart()
})

watch(
  availableYears,
  (newYears) => {
    if (newYears.length > 0) {
      selectedYears.value = newYears.slice(-3).map(Number)
    }
  },
  { immediate: true },
)
watch(chartData, () => renderChart(), { deep: true })
watch(selectedLeague, async () => await loadData(), { deep: true })
watch(selectedPosition, async () => await loadData(), { deep: true })
watch(ignoreOutliers, async () => await loadData(), { deep: true })

async function loadData() {
  await speedsStore.fetchNthSpeeds(selectedPosition.value, selectedLeague.value, ignoreOutliers.value)
}

function renderChart() {
  if (!canvasRef.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  const config: ChartConfiguration<'line'> = {
    type: 'line',
    data: chartData.value,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#CBD5E1',
            font: { family: 'sans-serif', size: 11 },
            usePointStyle: true,
            boxWidth: 8,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: '#1E293B',
          titleColor: '#F8FAFC',
          bodyColor: '#F1F5F9',
          borderColor: '#334155',
          borderWidth: 1,
        },
      },
      scales: {
        y: {
          min: minSpeed.value,
          max: maxSpeed.value,
          title: {
            display: true,
            text: 'Velocidades (km/h)',
            color: '#94A3B8',
            font: { weight: 'bold', size: 12 },
          },
          grid: {
            color: 'rgba(51, 65, 85, 0.3)',
          },
          ticks: {
            color: '#94A3B8',
          },
        },
        x: {
          title: {
            display: true,
            text: 'Número de Regata',
            color: '#94A3B8',
            font: { weight: 'bold', size: 12 },
          },
          grid: { display: false },
          ticks: {
            color: '#94A3B8',
          },
        },
      },
    },
  }

  chartInstance = new Chart(ctx, config)
}
</script>
