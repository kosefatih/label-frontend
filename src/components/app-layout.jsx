import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export function AppLayout({ children, title }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        </div>
      </header>
      <main className="w-full px-4 py-8">{children}</main>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}
