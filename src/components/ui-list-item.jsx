"use client"

export function UIListItem({ title, subtitle, isSelected, onClick, actions }) {
  return (
    <div
      onClick={onClick}
      className={`p-3 rounded cursor-pointer hover:bg-gray-100 transition-colors ${isSelected ? "bg-blue-100" : ""}`}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}
