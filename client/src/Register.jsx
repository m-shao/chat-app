import axios from "axios"
import { useContext, useState } from "react"
import { UserContext } from "./UserContext"

function Register() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext)

    const register = async (e) => {
        e.preventDefault()
        const {data} = await axios.post("/register", {username, password})
        setLoggedInUsername(username)
        setId(data.id)
    }

    return (
        <div className="bg-blue-50 h-screen flex items-center">
            <form action="" className="w-64 mx-auto mb-12" onSubmit={register}> 
                <input value={username} 
                    onChange={(e) => {setUsername(e.target.value)}} 
                    type="text" placeholder="username" 
                    className="block w-full rounded-sm p-2 mb-2 border"/>

                <input value={password} 
                    onChange={(e) => {setPassword(e.target.value)}} 
                    type="password" 
                    placeholder="password" 
                    className="block w-full rounded-sm p-2 mb-2 border"/>
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">Register</button>
            </form>
        </div>
    )
}

export default Register