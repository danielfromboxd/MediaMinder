import React from 'react'
import { Dashboard } from './pages'
import { Books } from './pages'
import { DetailedMediaView } from './pages'
import { Finished } from './pages'
import { InProgress } from './pages'
import { LogIn } from './pages'
import { Movies } from './pages'
import { Series } from './pages'
import { Settings } from './pages'
import { SignUp } from './pages'
import { WantToWatchRead } from './pages'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/books" element={<Books />} />
        <Route path="/media/:id" element={<DetailedMediaView />} />
        <Route path="/finished" element={<Finished />} />
        <Route path="/in-progress" element={<InProgress />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/want-to-watch-read" element={<WantToWatchRead />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App