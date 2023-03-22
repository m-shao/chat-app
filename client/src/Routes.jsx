import React, { useContext } from 'react'
import Register from './Register'
import { UserContext } from './UserContext'

function Routes() {
    const {username, id} = useContext(UserContext)

    if (username) {
        return 'logged in!'
    }
    
    return (
        <Register/>
    )
}

export default Routes