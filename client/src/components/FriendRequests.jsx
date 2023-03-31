import {useState} from 'react'

import Contact from './Contact'

function FriendRequests({friendRequests, sendFriendRequests}) {
    const [newFriend, setNewFriend] = useState('')
    
    const handleText = (e) => {
        setNewFriend(e.target.value)
    }
    
    const handleSubmit = (e) => {
        e.preventDefault()
        if (newFriend){
            sendFriendRequests(newFriend)
        }
        setNewFriend('')
    }

    return (
        <div className='flex-grow overflow-x-scroll mt-2'>
            <div>
                <form action="" className='w-full flex justify-center flex-row pl-5 pr-2 gap-2 mb-2' onSubmit={handleSubmit}> 
                    <input 
                        value={newFriend}
                        onChange={handleText} 
                        type="text" placeholder="Search Friend Username" 
                        className="block w-full rounded-sm p-2 border"/>
                    <button className="bg-blue-500 text-white block rounded-sm p-2 px-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                        </svg>
                    </button>
                </form>
            </div>
            <div>
                {friendRequests.map((username, index) => (
                <Contact
                    key={index}
                    username={username}
                    request={true}
                />
                ))}
            </div>
        </div>
    )
}

export default FriendRequests