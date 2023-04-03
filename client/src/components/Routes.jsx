import React, { useContext, useState } from 'react'
import Chat from './Chat'
import RegisterAndLoginForm from './RegisterAndLoginForm'
import { UserContext } from '../context/UserContext'

function Routes() {
    const {username, id} = useContext(UserContext)

    return (
        <div className='dark:text-white bg-black'>
            {username? <Chat/> : <RegisterAndLoginForm/>}
        </div>
    )
}

export default Routes