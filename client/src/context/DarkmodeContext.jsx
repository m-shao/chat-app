import React, { useState, useEffect } from 'react';

export const darkmodeContext = React.createContext()

export function DarkmodeProvider({ children }) {
    if (!localStorage.hasOwnProperty('darkmode')){
        localStorage.setItem('darkmode', false)
    }
    
    const [darkmode, setDarkmode] = useState(localStorage.getItem('darkmode') === "true")

    function changeDarkmode() {
        setDarkmode(prev => !prev)
    }

    useEffect(() => {
        localStorage.setItem('darkmode', darkmode)
    }, [darkmode])

    return (
        <darkmodeContext.Provider value={{darkmode, changeDarkmode}}>
            {children}
        </darkmodeContext.Provider>
    );
}
