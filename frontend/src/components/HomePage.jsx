import React from 'react'
import APropos from './APropos'
import Documentation from './Documentation'
import Accueil from './Accueil'
import Navbar from './Navbar'

const HomePage = () => {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden" >
        <Navbar />
        <Accueil />
        <APropos />
        <Documentation />
    </div>
  )
}

export default HomePage