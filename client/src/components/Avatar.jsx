import React from 'react'

function Avatar({userId, username, online}) {

    const colors = ['bg-red-200', 'bg-green-200', 'bg-purple-200', 
                    'bg-clue-200', 'bg-yellow-200', 'bg-teal-200']

    const userIdBase10 = parseInt(userId, 16)
    const colorIndex = userIdBase10 % colors.length
    const color = colors[colorIndex]

    return (
        <div className={'w-8 h-8 relative rounded-full flex items-center justify-center weight ' + color}>
            <div className='text-center w-full opacity-70'>{username[0]}</div>
            <div className={'absolute w-3 h-3 border border-white rounded-full right-0 bottom-0 ' + (online ? "bg-green-500" : "bg-gray-400")}></div>
        </div>
    )
}

export default Avatar