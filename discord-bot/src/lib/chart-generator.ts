export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string
    borderColor?: string
  }[]
}

// export function generateChartUrl(type: 'line' | 'bar' | 'pie', data: ChartData, title: string): string {
//   const chartConfig = {
//     type,
//     data: {
//       labels: data.labels,
//       datasets: data.datasets.map(dataset => ({
//         ...dataset,
//         backgroundColor: dataset.backgroundColor || 'rgba(88, 101, 242, 0.5)',
//         borderColor: dataset.borderColor || 'rgba(88, 101, 242, 1)',
//         borderWidth: 2,
//       })),
//     },
//     options: {
//       title: {
//         display: true,
//         text: title,
//         fontSize: 16,
//       },
//       legend: {
//         display: true,
//       },
//       scales: type !== 'pie' ? {
//         yAxes: [{
//           ticks: {
//             beginAtZero: true,
//           },
//         }],
//       } : undefined,
//     },
//   }

//   const encodedConfig = encodeURIComponent(JSON.stringify(chartConfig))
//   return `https://quickchart.io/chart?c=${encodedConfig}&width=600&height=400&backgroundColor=white`
// }

export function generateAsciiChart(labels: string[], data: number[], title?: string, maxWidth: number = 20): string {
  if (data.length === 0) {
    return '\`\`\`\nNo data available\n\`\`\`'
  }

  const max = Math.max(...data)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  
  let chart = '\`\`\`\n'
  
  if (title) {
    chart += `${title}\n${'─'.repeat(maxWidth + 20)}\n`
  }
  
  for (let i = 0; i < data.length; i++) {
    const value = data[i]
    const normalized = ((value - min) / range) * maxWidth
    const barLength = Math.max(0, Math.round(normalized))
    const bars = '█'.repeat(barLength)
    const label = labels[i].substring(0, 10).padEnd(11)
    chart += `${label} ${bars} ${value}\n`
  }
  
  chart += '\`\`\`'
  return chart
}
