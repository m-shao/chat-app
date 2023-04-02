import React from 'react'
import Contact from './Contact'

function Friends({onlinePeopleExcludeSelf, selectedUserId, changeSelectedUserId, offlinePeople, friends}) {
  return (
    <div className="flex-grow overflow-x-scroll">
        <div className=''>
            {Object.keys(onlinePeopleExcludeSelf).map(userId => (
            friends.includes(onlinePeopleExcludeSelf[userId]) &&
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
    </div> 
  )
}

export default Friends