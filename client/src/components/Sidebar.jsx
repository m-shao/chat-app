import { useState, useEffect } from 'react'
import Contact from "./Contact"
import Logo from "./Logo"
import Friends from './Friends'
import axios from 'axios'
import FriendRequests from "./FriendRequests"
import Settings from './Settings'

function Sidebar({onlinePeopleExcludeSelf, selectedUserId, changeSelectedUserId, offlinePeople, id, username, logout, friends}) {
    
    const [friendRequestPage, setFriendRequestPage] = useState(false)
    const [friendRequests, setFriendRequests] = useState([])
    const [selectedUsername, setSelectedUsername] = useState("")
    const [settings, setSettings] = useState(false)
    const [open, setOpen] = useState(true)

    useEffect(() => {
        if (onlinePeopleExcludeSelf[selectedUserId]){
            setSelectedUsername(onlinePeopleExcludeSelf[selectedUserId])
        } else if (offlinePeople[selectedUserId]){
            setSelectedUsername(offlinePeople[selectedUserId].username)
        } else{
            setSelectedUsername("")
        }
         
    }, [selectedUserId])

    const sendFriendRequests = async(friend) => {
        await axios.post('/friend-request', {username, target:friend})
    }

    const getFriendRequests = async(user) => {
        const tempFriendRequests = await axios.get("/friend-request/" + user)
        setFriendRequests(tempFriendRequests?.data)
    }

    const verifyFriendRequests = async(username, target, state) => {
        const tempArr = [...friendRequests]
        let index = tempArr.indexOf(username);
        if (index !== -1) {
            tempArr.splice(index, 1);
        }
        setFriendRequests(tempArr)
        const tempFriends = await axios.put("/friend-request", {username:target, target:username, state:state})
    }

    useEffect(() => {
        getFriendRequests(username)
    }, [])


    return (
        <>
            <div className={"absolute z-20 w-screen bg-white p-5 transition-all duration-300 flex items-center dark:bg-slate-800 " + (open && "-translate-y-full")}>
                <svg onClick={() => setOpen(true)} className={"w-10 h-10"} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <h1 className='text-xl ml-5'>
                    {selectedUsername}
                </h1>
            </div>
            

            <div className={"bg-white pt-6 flex flex-col max-w-sm transition-all duration-300 sm:absolute z-10 sm:h-full sm:w-3/4 h-full dark:bg-slate-800 " 
            + (!open ? " absolute -translate-x-full w-0 opacity-0" : "w-1/3")}>
                <button onClick={() => setOpen(false)}>
                    <Logo/>
                </button>
                {settings ? <Settings logout={logout}/> :
                    <div className='h-full w-full'>
                        <button onClick={() => {setFriendRequestPage(prev => !prev)}}
                        className={"flex gap-2 border-b border-gray-100 dark:border-slate-700 pl-5 py-3 w-full "  + (friendRequestPage && "bg-gray-100 dark:bg-slate-700")}>
                            <div className='relative'>  
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                {friendRequests.length > 0 && <div className='bg-red-500 w-2.5 h-2.5 rounded-full absolute top-0 right-0'></div>}
                                
                            </div>
                            <h1>Friends</h1>
                        </button> 
                    
                        {friendRequestPage ? 
                            <FriendRequests 
                                sendFriendRequests={sendFriendRequests} 
                                friendRequests={friendRequests}
                                verifyFriendRequests={verifyFriendRequests}
                                user={username}/> :
                            <Friends 
                                onlinePeopleExcludeSelf={onlinePeopleExcludeSelf} 
                                selectedUserId={selectedUserId} 
                                changeSelectedUserId={changeSelectedUserId} 
                                offlinePeople={offlinePeople}
                                friends={friends}/>}
                    </div>
                }
                
            
                
                <div className="p-2 text-center flex justify-around items-center relative">
                    <div className='w-full' onClick={() => {}}>
                        <Contact id={id} username={username} selected={false} online={true}/>
                    </div>
                    
                    <button className='mr-2' onClick={() => {setSettings(prev => !prev)}}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Sidebar
