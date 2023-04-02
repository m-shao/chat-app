import { useState, useEffect } from 'react'
import Contact from "./Contact"
import Logo from "./Logo"
import Friends from './Friends'
import axios from 'axios'
import FriendRequests from "./FriendRequests"

function Sidebar({onlinePeopleExcludeSelf, selectedUserId, changeSelectedUserId, offlinePeople, id, username, logout, friends}) {
    
    const [friendRequestPage, setFriendRequestPage] = useState(false)
    const [friendRequests, setFriendRequests] = useState([])

    const sendFriendRequests = async(friend) => {
        const friendRequests = await axios.post('/friend-request', {username, target:friend})
        setFriendRequests(friendRequests)
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
        <div className="bg-white w-1/3 pt-6 flex flex-col max-w-sm">
            <Logo/>
            <button onClick={() => {setFriendRequestPage(prev => !prev)}} 
            className={"flex gap-2 border-b border-gray-100 pl-5 py-3 "  + (friendRequestPage && "bg-gray-100")}>
                <div className='relative'>  
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                    {friendRequests.length > 0 && <div className='bg-red-500 w-2.5 h-2.5 rounded-full absolute top-0 right-0'></div>}
                    
                </div>
                <h1>Friends</h1>
            </button> 
            
            {friendRequestPage ? 
                <FriendRequests sendFriendRequests={sendFriendRequests} 
                                friendRequests={friendRequests}
                                verifyFriendRequests={verifyFriendRequests}
                                user={username}/> :
                <Friends onlinePeopleExcludeSelf={onlinePeopleExcludeSelf} 
                    selectedUserId={selectedUserId} 
                    changeSelectedUserId={changeSelectedUserId} 
                    offlinePeople={offlinePeople}
                    friends={friends}/>}
        
            
            <div className="p-2 text-center flex justify-around items-center">
                <div className='w-full'>
                    <Contact id={id} username={username} selected={false} online={true}/>
                </div>
                <button
                    onClick={logout}
                    className="text-sm text-gray-500 bg-blue-100 py-2 px-3 border rounded-sm">
                    Logout
                </button>
            </div>
        </div>
    )
}

export default Sidebar