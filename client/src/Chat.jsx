import { useEffect, useState, useContext} from "react"

import Avatar from "./Avatar"
import Logo from "./Logo"
import { UserContext } from "./UserContext"

function Chat() {
    
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null)
    const [newMessageText, setNewMessageText] = useState("")
    const {id} = useContext(UserContext)

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:4040')
        setWs(ws)
        ws.addEventListener('message', handleMessage)
    }, [])

    const showOnlinePeople = (peopleArray) => {
        const people = {}
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }

    const handleMessage = (e) => {
        const messageData = JSON.parse(e.data)
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        } else{
            console.log({messageData})
        }
    }

    const sendMessage = (e) => {
        e.preventDefault()
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText
        }))
        setNewMessageText("")
    }

    const onlinePeopleExcludeSelf = {...onlinePeople}
    delete onlinePeopleExcludeSelf[id]

    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 pt-6">
                <Logo/>
                {Object.keys(onlinePeopleExcludeSelf).map(userId => (
                    <div key={userId} onClick={() => {setSelectedUserId(userId)}} 
                        className={"border-b border-grap-100 py-2 flex gap-2 items-center cursor-pointer p-6 " + (userId === selectedUserId && "bg-blue-100")}>
                        {userId === selectedUserId && (
                            <div className="w-1 bg-blue-500 h-12 absolute left-0"></div>
                        )}
                        <Avatar username={onlinePeople[userId]} userId={userId}/>
                        <span className="text-gray-800">{onlinePeople[userId]}</span>
                    </div>
                ))}
            </div>

            <div className="flex flex-col  bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId ? 
                    <div className="flex h-full w-full justify-center items-center">
                        <span className="text-xl">&larr; Select a Conversation</span>
                    </div> :"Messages with selected person"
                    }
                    
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text" 
                                value={newMessageText}
                                onChange={e => setNewMessageText(e.target.value)}
                                placeholder="Type your message here" 
                                className="bg-white flex-grow border p-2 rounded-sm" />

                        <button type="submit" className="bg-blue-500 p-2 text-white rounded-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                            </svg>

                        </button>
                    </form>
                )}
                
            </div>
        </div>
    )
}

export default Chat