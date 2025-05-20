import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContent } from '../context/AppContext'
import '../index.css';
import { useNavigate } from 'react-router-dom';

const Header = () => {

    const {userData} = useContext(AppContent)
    const navigate = useNavigate();


  return (
    <div className='flex flex-col items-center mt-20 px-4 text-center text-gray-800'>
      <div className="relative w-36 h-36 mb-6">
        {/* Rotating Gear */}
        <img src={assets.header_img2} alt="Gear" className="absolute inset-0 w-full h-full animate-spin-slow" />
        
        {/* Static Eye */}
        <img src={assets.header_img1} alt="Eye" className="absolute inset-0 w-full h-full" />
      </div>
      <h1 className='flex items-center gap-2 text-xl sm:text-3xl font-medium mb-2'>Hey, {userData ? userData.name: 'QCitizen'}! 
        <img src={assets.hand_wave} alt="" className='w-8 aspect-square'/></h1>
      <h2 className='text-3xl sm:text-5xl font-semibold mb-4'>Welcome to E-Alerto</h2>
      <p className='mb-8 max-w-md'>Manage reports, monitor agency responses, and uphold accountability. Get started with your dashboard tasks and help keep QC roads safe and efficient.</p>
      <button onClick={() => navigate('./e-alerto/html/index.html')}className='border border-gray-500 rounded-full px-8 py-2.5 hover:bg-gray-100 transition-all'>Learn More</button>
    </div>
  )
}

export default Header
