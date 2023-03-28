import { useEffect, useState, useContext, useRef} from "react"
import axios from 'axios'

import {uniqBy} from 'lodash'

import Contact from "./Contact"
import Logo from "./Logo"
import { UserContext } from "./UserContext"

function Chat() {
    //init states
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [offlinePeople, setOfflinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState("")
    const [newMessageText, setNewMessageText] = useState("")
    const [messages, setMessages] = useState([])
    const {username, id, setUsername, setId} = useContext(UserContext)
    const divUnderMessages = useRef()

    //connect to user's web socket whenever we switch users
    useEffect(() => {
        connectToWs()
    }, [selectedUserId])

    //connect to websocket
    function connectToWs() {
        const ws = new WebSocket('ws://localhost:4040')
        setWs(ws)
        //whenever message is reveived: handle message
        ws.addEventListener('message', handleMessage)
        //whenever ws closes: reconnect
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log('Disconnected, Trying to Reconnect')
                connectToWs()
            })
        })
    }

    //set onlinePeople state to object of online people
    function showOnlinePeople(peopleArray){
        const people = {}
        peopleArray.forEach(({userId, username}) => {
            people[userId] = username
        })
        setOnlinePeople(people)
    }

    //when message is reveived:
    function handleMessage(e) {
        //reveive message data
        const messageData = JSON.parse(e.data)
        
        if ('online' in messageData) {
            showOnlinePeople(messageData.online)
        } else if ('text' in messageData) {
            //if the message reveiveed is from the current user, add it to the conversation
            if (messageData.sender === selectedUserId) {
                setMessages(prev => ([...prev, {...messageData}]))
            }
        }
      }

    //when user requests a logout, terminate web socket, remove id and username
    function logout() {
        axios.post('/logout').then(() => {
            setWs(null)
            setId(null)
            setUsername(null)
        })
    }

    //when you send a message:
    function sendMessage(e, file = null){
        //if an event is provided(which mean's it's not a file)
        if (e){
            e.preventDefault()
        }
        
        //send message to backend with the who you're sending it to, the text or the file
        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file: file,
        }))
        //reset the text field
        setNewMessageText("")
        //append the message onto messages state
        setMessages(prev => ([...prev, {
            text: newMessageText,
            sender: id,
            recipient: selectedUserId,
            _id: Date.now()
        }]))
        //if there is a file, 
        if (file) {
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data)
            })
        }
    }

    function sendFile(e){
        //create a reader object and read the file given
        const reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        //send a message with the file attached and no event
        reader.onload = () => {
            sendMessage(null, {
                name: e.target.files[0].name,
                data: reader.result
            })
        }
        
    }

    //whenever we add a message scroll to the bottom
    useEffect(() => {
        const div = divUnderMessages?.current
        div?.scrollIntoView({behaviour: 'smooth', block:'end'})
    }, [messages])

    //whenever the online people changes, find the people who are offline and setOfflinePeople(offlinePeople)
    useEffect(() => {
        //filter the online people out and then put into object form
        axios.get('/people').then(res => {
            const offlinePeopleArr = res.data
                                .filter(p => p._id !==id)
                                .filter(p => !Object.keys(onlinePeople).includes(p._id))
            let offlinePeople = {}
            offlinePeopleArr.forEach(p => {
                offlinePeople[p._id] = p
            })
            setOfflinePeople(offlinePeople)          
        })
    }, [onlinePeople])

    //once we chose a user to talk to, load all their messages
    useEffect(() => {
        if (selectedUserId){
            axios.get('/messages/' + selectedUserId).then(res => {
                setMessages(res.data)
            })

        }
    }, [selectedUserId])

    //get a list of online people exluding the user
    const onlinePeopleExcludeSelf = {...onlinePeople}
    delete onlinePeopleExcludeSelf[id]

    //remove duplicates from message because of double sends
    const messagesWithoutDupes = uniqBy(messages, '_id')
    return (
        <div className="flex h-screen">
            <div className="bg-white w-1/3 pt-6 flex flex-col">
                <div className="flex-grow">
                    <Logo/>
                    {Object.keys(onlinePeopleExcludeSelf).map(userId => (
                    <Contact
                        key={userId}
                        id={userId}
                        online={true}
                        username={onlinePeopleExcludeSelf[userId]}
                        onClick={() => setSelectedUserId(userId)}
                        selected={userId === selectedUserId} />
                    ))}
                    {Object.keys(offlinePeople).map(userId => (
                        <Contact
                        key={userId}
                        id={userId}
                        online={false}
                        username={offlinePeople[userId].username}
                        onClick={() => setSelectedUserId(userId)}
                        selected={userId === selectedUserId} />
                    ))}
                </div> 
                <div className="p-2 text-center">
                    <span className="mr-2 text-sm, text-gray-600">Logged In as {username}</span>
                    <button 
                        onClick={logout}
                        className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-md">
                        Logout
                        </button>
                </div>
            </div>

            <div className="flex flex-col bg-blue-50 w-2/3 p-2">
                <div className="flex-grow">
                    {!selectedUserId && 
                    <div className="flex h-full w-full justify-center items-center">
                        <span className="text-xl">&larr; Select a Conversation</span>
                    </div>
                    }

                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                {messagesWithoutDupes.map((message, index) => (
                                    <div key={index} dir={message.sender === id ? 'rtl' : 'ltr'} className={"block"}>
                                        <div className={"max-w-xl sm:max-w-[80%] block"}>
                                            <div className={"p-2 px-4 m-2 rounded-2xl inline-block " + 
                                            (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white text-gray-500')}>
                                                <h1 dir="ltr">
                                                    {message.text}
                                                    {message.file && (
                                                        <div className="flex items-center">
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                                            </svg>
                                                            <a target={"_blank"} className="underline" href={axios.defaults.baseURL + "/uploads/" + message.file}>
                                                                {message.file}
                                                            </a>
                                                        </div>
                                                        
                                                    )}
                                                    </h1>
                                                
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    )}
                    
                </div>
                {!!selectedUserId && (
                    <form className="flex gap-2" onSubmit={sendMessage}>
                        <input type="text" 
                                value={newMessageText}
                                onChange={e => setNewMessageText(e.target.value)}
                                placeholder="Type your message here" 
                                className="bg-white flex-grow border p-2 rounded-sm" />
                        <label type="submit" className="bg-gray-300 p-2 text-white rounded-sm cursor-pointer">
                            <input type="file" className="hidden" onChange={sendFile}/>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                            </svg>
                        </label>
                        
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