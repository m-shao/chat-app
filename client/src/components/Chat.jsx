import { useEffect, useState, useContext, useRef} from "react"
import axios from 'axios'

import {uniqBy} from 'lodash'
import Sidebar from "./Sidebar"
import MessagesDisplay from "./MessagesDisplay"
import { UserContext } from "../context/UserContext"

function Chat() {
    //init states
    const [ws, setWs] = useState(null)
    const [onlinePeople, setOnlinePeople] = useState({})
    const [offlinePeople, setOfflinePeople] = useState({})
    const [friends, setFriends] = useState([])
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

    const getFriends = async(user) => {
        const tempFriends = await axios.get("/friends/" + user)
        setFriends(tempFriends.data)
    }

    //set onlinePeople state to object of online people
    const showOnlinePeople = async (peopleArray) =>{
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
            getFriends(username)
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
        axios.get('/people/' + username).then(res => {
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
    // const onlinePeopleExcludeSelf = {...onlineFriends}
    const onlinePeopleExcludeSelf = {...onlinePeople}
    delete onlinePeopleExcludeSelf[id]

    //remove duplicates from message because of double sends
    const messagesWithoutDupes = uniqBy(messages, '_id')

    function changeSelectedUserId (id) {
        setSelectedUserId(id)
    }
    
    return (
        <div className="flex h-screen">
            <Sidebar onlinePeopleExcludeSelf={onlinePeopleExcludeSelf} 
                    selectedUserId={selectedUserId} 
                    changeSelectedUserId={changeSelectedUserId}
                    // offlinePeople={offlineFriends}
                    offlinePeople={offlinePeople}
                    username={username} logout={logout}
                    id={id}
                    friends={friends}
                    />

            <div className="flex flex-col bg-blue-50 w-2/3 p-2 flex-grow dark:bg-neutral-900">
                <div className="flex-grow">
                    {!selectedUserId && 
                    <div className="flex h-full w-full justify-center items-center">
                        <span className="text-xl">&larr; Select a Conversation</span>
                    </div>
                    }

                    {!!selectedUserId && (
                        <div className="relative h-full">
                            <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                                <MessagesDisplay messagesWithoutDupes={messagesWithoutDupes} id={id}/>
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
                                className="bg-white dark:bg-neutral-800 dark:border-neutral-700 flex-grow border p-2 px-4 rounded-full" />
                        <label type="submit" className="bg-gray-300 dark:bg-neutral-800 p-3 text-white rounded-full cursor-pointer">
                            <input type="file" className="hidden" onChange={sendFile}/>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600 dark:text-gray-500">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                            </svg>
                        </label>
                        <button type="submit" className="bg-blue-500 p-3 text-white rounded-full">
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