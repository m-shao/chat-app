import axios from "axios"
import { UserContextProvider } from "./context/UserContext"
import Routes from "./components/Routes"

function App() {
  axios.defaults.baseURL = "http://localhost:4040"
  axios.defaults.withCredentials = true

  return (
    
      <div className={"App "}>
        <UserContextProvider>
          <Routes/>
        </UserContextProvider>
      </div>
  )
}

export default App
