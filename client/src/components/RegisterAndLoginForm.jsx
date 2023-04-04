import axios from "axios"
import { useContext, useState } from "react"
import { UserContext } from "../context/UserContext"

function RegisterAndLoginForm() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLoginOrRegister, setIsLoginOrRegister] = useState("login")

    const {setUsername:setLoggedInUsername, setId} = useContext(UserContext)

    const handleSubmit = async (e) => {
        const url = isLoginOrRegister === "register" ? '/register': '/login'
        e.preventDefault()
        const {data} = await axios.post(url, {username, password})
        setLoggedInUsername(username)
        setId(data.id)
    }

    return (
        <div className="bg-blue-50 dark:bg-neutral-900 h-screen flex items-center">
            <form action="" className="w-64 mx-auto mb-12" onSubmit={handleSubmit}> 
                <input value={username} 
                    onChange={(e) => {setUsername(e.target.value)}} 
                    type="text" placeholder="username" 
                    className="block w-full rounded-sm p-2 mb-2 border dark:bg-neutral-800 dark:border-neutral-900"/>

                <input value={password} 
                    onChange={(e) => {setPassword(e.target.value)}} 
                    type="password" 
                    placeholder="password" 
                    className="block w-full rounded-sm p-2 mb-2 border dark:bg-neutral-800 dark:border-neutral-900"/>
                <button className="bg-blue-500 text-white block w-full rounded-sm p-2">{
                    isLoginOrRegister === "register"? "Register" : "Login"}
                </button>
                <div className="text-center mt-2 dark:text-neutral-500">
                    
                    {isLoginOrRegister === "register" && (
                        <div>
                            <p className="inline">Already a member? </p>
                            <button onClick={() => {setIsLoginOrRegister("login")}}>
                                Login Here
                            </button>
                        </div>
                    ) }
                    {isLoginOrRegister === 'login' && (
                        <div>
                        <p className="inline">Don't have an account? </p>
                        <button onClick={() => {setIsLoginOrRegister("register")}}>
                            Register
                        </button>
                    </div>
                    )}
                    
                    </div>
            </form>
        </div>
    )
}

export default RegisterAndLoginForm