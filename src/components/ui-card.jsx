export function UICard({ title, children, actionButton }) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {actionButton}
        </div>
        {children}
      </div>
    )
  }
  