import { BrowserRouter, Routes, Route } from 'react-router-dom'
import StudentPortal from './pages/StudentPortal'
import AdminPortal from './pages/AdminPortal'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StudentPortal />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App