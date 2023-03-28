import React from 'react'
import Contact from "./Contact"
import Logo from "./Logo"

function Sidebar({onlinePeopleExcludeSelf, selectedUserId, changeSelectedUserId, offlinePeople, username, logout}) {
  return (
    <div className="bg-white w-1/3 pt-6 flex flex-col">
        <div className="flex-grow">
            <Logo/>
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
        <div className="p-2 text-center">
            <span className="mr-2 text-sm, text-gray-600">Logged In as {username}</span>
            <button 
                onClick={logout}
                className="text-sm text-gray-500 bg-blue-100 py-1 px-2 border rounded-md">
                Logout
                </button>
        </div>
    </div>
  )
}

export default Sidebar