import axios from "axios"
import { UserContextProvider } from "./UserContext"
import Routes from "./Routes"

function App() {
  axios.defaults.baseURL = "http://localhost:4040"
  axios.defaults.withCredentials = true

  return (
      <div className="App">
        <UserContextProvider>
          <Routes/>
        </UserContextProvider>
      </div>
  )
}

export default App
