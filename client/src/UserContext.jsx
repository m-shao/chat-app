import { createContext, useState } from "react"

export const UserContext = createContext({})

export const UserContextProvider = ({children}) => {
    const [username, setUsername] = useState(null)
    const [id, setId] = useState(null)

    return(
        <UserContext.Provider value={{username, setUsername, id, setId}}> 
            {children}
        </UserContext.Provider>
    )
}