import React, { useEffect, useState } from 'react'
import Chat from './component/Chat';




const App = () => {
  const [isUserNameSet, setIsUserNameSet] = useState<boolean>(false)
  const [name, setName] = useState<string>("")
  const [roomid,setRoomId] = useState('')


  const handleLogin = async () => {
    if (!name.trim()) return
    setIsUserNameSet(true)
  }


  return (
    <div>
      {!isUserNameSet ? (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white mb-2">Welcome</h1>
              <p className="text-gray-400">Enter your name to continue</p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />

              <input
                type="text"
                placeholder="Enter roomid"
                value={roomid}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />


              <button
                onClick={handleLogin}
                disabled={!name.trim()}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors duration-200"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      ) : (
        <Chat name={name} roomid={roomid}/>
      )}
    </div>
  )
}

export default App
