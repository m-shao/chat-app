import { useState, useEffect } from 'react'
import Contact from "./Contact"
import Logo from "./Logo"

function Sidebar({onlinePeopleExcludeSelf, selectedUserId, changeSelectedUserId, offlinePeople, id, username, logout}) {
    
    const [friendRequest, setFriendRequest] = useState(false)
    return (
        <div className="bg-white w-1/3 pt-6 flex flex-col max-w-sm">
            <div className="flex-grow">
                <Logo/>
                <div className="flex gap-2 border-b border-gray-100 ml-5 pb-2">
                    <div className='relative'>  
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        {friendRequest && <div className='bg-red-500 w-2.5 h-2.5 rounded-full absolute top-0 right-0'></div>}
                        
                    </div>
                    <h1>Friends</h1>
                </div> 
                {Object.keys(onlinePeopleExcludeSelf).map(userId => (
                <Contact
                    key={userId}
                    id={userId}
                    online={true}
                    username={onlinePeopleExcludeSelf[userId]}
                    onClick={() => changeSelectedUserId(userId)}
                    selected={userId === selectedUserId} />
                ))}
                {Object.keys(offlinePeople).map(userId => (
                    <Contact
                    key={userId}
                    id={userId}
                    online={false}
                    username={offlinePeople[userId].username}
                    onClick={() => changeSelectedUserId(userId)}
                    selected={userId === selectedUserId} />
                ))}
            </div> 
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