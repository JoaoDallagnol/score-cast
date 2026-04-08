import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './Layout'
import Championships from './pages/Championships'
import ChampionshipDetail from './pages/ChampionshipDetail'
import Schools from './pages/Schools'
import Predictions from './pages/Predictions'

import Management from './pages/Management'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Championships />} />
          <Route path="/championships/:id" element={<ChampionshipDetail />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/predictions" element={<Predictions />} />
          <Route path="/management" element={<Management />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
