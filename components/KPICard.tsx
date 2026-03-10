// components/KPICard.tsx
import React from 'react'

interface KPICardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  change?: number        // pourcentage de variation
  subtitle?: string
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  change,
  subtitle,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500 font-medium">{title}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>

      <span className="text-3xl font-bold text-gray-900">{value}</span>

      {change !== undefined && (
        <span
          className={`text-sm font-medium ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
        </span>
      )}

      {subtitle && (
        <span className="text-xs text-gray-400">{subtitle}</span>
      )}
    </div>
  )
}
