import React from 'react'
import axios from 'axios'

function MessagesDisplay({messagesWithoutDupes, id}) {
  return (
    <div className='mt-20'>
        {messagesWithoutDupes.map((message, index) => (
            <div key={index} dir={message.sender === id ? 'rtl' : 'ltr'} className={"block"}>
                <div className={"max-w-xl sm:max-w-[80%] block"}>
                    {message.file ? (
                        <div>
                            {
                            ["png", "jpg", "jpeg", "gif", "svg"].includes(message.file.split(".")[1])? 
                            <div className="max-w-xs w-full rounded-2xl mb-2">
                                <a href={axios.defaults.baseURL + "/uploads/" + message.file} target="_blank">
                                    <img src={axios.defaults.baseURL + "/uploads/" + message.file}/>
                                </a> 
                            </div>
                            :
                            <div className="flex items-center">
                                <div className={"p-2 px-4 m-2 rounded-3xl inline-block " + 
                                (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-900 text-gray-500')}>
                                    <div className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                                        </svg>
                                    <a target={"_blank"} className="underline" href={axios.defaults.baseURL + "/uploads/" + message.file}>
                                        {message.file}
                                    </a>
                                </div>     
                                </div>
                                
                            </div>}
                        </div>
                    ) :
                    <div className={"p-2 px-4 m-2 rounded-3xl inline-block " + 
                    (message.sender === id ? 'bg-blue-500 text-white' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-white')}>
                        <h1 dir="ltr">
                            {message.text}
                        </h1>        
                    </div>}
                </div>
            </div>
        ))}
    </div>
  )
}

export default MessagesDisplay