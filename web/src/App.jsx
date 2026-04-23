import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Championships from './pages/Championships'
import ChampionshipLayout from './pages/ChampionshipLayout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Championships />} />
          <Route path="/championships/:id" element={<ChampionshipLayout />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}