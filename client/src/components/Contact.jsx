import Avatar from "./Avatar.jsx";

function Contact({id, username, onClick, selected, online, request, verifyFriendRequests, user}) {
    return (
        <div key={id ? id : username} 
            onClick={id?() => onClick(id): () => {}}
            className={"border-b border-gray-100 dark:border-slate-700 flex justify-between items-center gap-2 cursor-pointer pr-4 "
            + (selected ? 'bg-blue-50 dark:bg-slate-700' : '')}>   
            <div className="flex">
                {selected && (
                    <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
                )}
                <div className="flex gap-2 py-2 pl-4 items-center">
                    <Avatar online={online} username={username}/>
                    <span className="text-gray-800 dark:text-gray-100">{username}</span>
                </div>
            </div> 
            {request && 
                <div className="flex items-center gap-2">
                    <button onClick={() => {verifyFriendRequests(username, user, true)}}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:brightness-90">
                            <g clipPath="url(#clip0_3_15)">
                                <circle cx="10" cy="10" r="9.5" fill="white" stroke="#D1D5DB"/>
                                <path d="M5.41666 11.25L8.74999 14.5833L15 6.25" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_3_15">
                                    <rect width="20" height="20" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                    </button>
                    <button onClick={() => {verifyFriendRequests(username, user, false)}}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="hover:brightness-90">
                            <g clipPath="url(#clip0_3_19)">
                                <circle cx="10" cy="10" r="9.5" fill="white" stroke="#D1D5DB"/>
                                <path d="M5 15L15 5M5 5L15 15" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_3_19">
                                    <rect width="20" height="20" fill="white"/>
                                </clipPath>
                            </defs> 
                        </svg>
                    </button>
                </div>
            } 
        </div>
    )
}

export default Contact