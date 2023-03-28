import React, { useContext } from 'react'
import Chat from './Chat'
import RegisterAndLoginForm from './RegisterAndLoginForm'
import { UserContext } from '../context/UserContext'

function Routes() {
    const {username, id} = useContext(UserContext)

    if (username) {
        return <Chat/>
    }
    
    return (
        <RegisterAndLoginForm/>
    )
}

export default Routes