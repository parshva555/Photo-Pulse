import React from 'react'
import { useState } from 'react'
import { TbSocial } from 'react-icons/tb'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import CustomButton from './CustomButton'
import TextInput from './TextInput'
import { useForm } from 'react-hook-form'
import { BsMoon, BsSunFill} from 'react-icons/bs'
import {IoMdNotificationsOutline} from 'react-icons/io'
import { ImCamera } from "react-icons/im";
import { SetTheme } from '../redux/theme'
import { Logout } from '../redux/userSlice'
const isMobile = window.innerWidth <= 768;

const TopBar = () => {
    const {theme} = useSelector(state => state.theme)
    const {user} = useSelector(state => state.user)
    const dispatch = useDispatch();
    const {register,handleSubmit,formState:{errors}} = useForm();
    const handleTheme = () =>{
        const themeValue = theme === 'light' ? "dark" : "light";
        dispatch(SetTheme(themeValue))
    }
    const handleSearch = async (data) =>{

    }
  


  return (
    <div className='topbar  w-full flex items-center  justify-between py-3 md:py-6 px-4 bg-primary'>
        <Link to='/' className='flex gap-2 items-center'>
        <div className='p-1 md:p-2 bg-[#e09200] rounded text-white'>
            <ImCamera/>
          </div>
          <span className='text-xl md:text-2xl text-[#e09200]  font-semibold'>
            Photo Pulse
          </span>
        </Link>
        <div className='md:flex md:items-center'>
        <form className={`flex items-center ${isMobile ? 'flex-col' : 'justify-center'
            }`} onSubmit={handleSubmit(handleSearch)}>

          <TextInput
          placeholder='Search...'
          styles={`w-[8rem] lg:w-[36rem] rounded-l-full py-1 ${
            isMobile ? 'rounded-full' : 'rounded-l-full'
          }`}
          register={register("search")}
          />
          <CustomButton
          title='Search'
          type='submit'
          containerStyles='bg-[#e09200] text-white px-1.5 py-2.5 mt-2 rounded-r-full'
          />

</form>
        </div>
        {/* Icons */}
        <div className='flex gap-2.5 items-center text-ascent-1 text-md md:text-xl'>
            <button onClick={()=>handleTheme()}>
                {theme==='dark'? <BsMoon/> : <BsSunFill/>}
            </button>
            <div className='hidden lg:flex'>
                <IoMdNotificationsOutline/>
            </div>
            <div>
            <CustomButton
                onCLick = {() => dispatch(Logout())}
                title='Log Out'
                containerStyles='text-sm text-ascent-1 px-4 md:px-6 py-1 md:py-2 border border-[#666] rounded-full'
                />
            </div>
        </div>
    </div>
  )
}

export default TopBar