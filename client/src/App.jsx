import axios from "axios"
import { UserContextProvider } from "./context/UserContext"
import { darkmodeContext } from "./context/DarkmodeContext"
import Routes from "./components/Routes"
import { useContext } from "react"

function App() {
  axios.defaults.baseURL = "http://localhost:4040"
  axios.defaults.withCredentials = true

  const {darkmode} = useContext(darkmodeContext)

  return (
      <div className={"App " + (darkmode === true ? "dark" : "")}>
        <UserContextProvider>
          <Routes />
        </UserContextProvider>
      </div>
  )
}

export default App
