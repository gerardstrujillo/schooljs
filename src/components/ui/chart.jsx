import {
  Bar,
  CartesianGrid,
  Cell,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  LineChart
} from 'recharts'

export function ChartContainer({ children, className = '' }) {
  return (
    <div className={`h-[280px] w-full min-h-0 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

export function ChartTooltipContent({ active, payload, label, formatter, labelFormatter }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 font-medium text-gray-900">
        {labelFormatter ? labelFormatter(label) : label}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <p key={entry.dataKey} className="text-gray-600">
            {entry.name}: {formatter ? formatter(entry.value, entry.name) : entry.value}
          </p>
        ))}
      </div>
    </div>
  )
}

export function DashboardPieChart({ data }) {
  return (
    <ChartContainer className="h-[260px]">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          innerRadius={62}
          outerRadius={94}
          paddingAngle={3}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [value, name]}
          contentStyle={{ borderRadius: 8, borderColor: '#e5e7eb' }}
        />
      </PieChart>
    </ChartContainer>
  )
}

export { Bar, BarChart, CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis }
