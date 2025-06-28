import React, { useEffect } from 'react'

import { useState } from "react"
import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from "lucide-react"
import { io, Socket } from 'socket.io-client';

interface Message {
    id: number
    text: string
    sender: string
    name: string
    timestamp: Date
}


// const socket: Socket = io('http://localhost:3000');
interface ChatProps {
    name: string;
    roomid: string
}

const Chat = ({ name, roomid }: ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputMessage, setInputMessage] = useState("")
    const [typing, setTyping] = useState<string | null>(null)

    const socketRef = useRef<Socket | null>(null)

    let typingTimeOut: NodeJS.Timeout;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        setInputMessage(value)

        socketRef.current?.emit('typing', { roomid, name })

        clearTimeout(typingTimeOut)

        typingTimeOut = setTimeout(() => {
            socketRef.current?.emit('stop-typing', roomid)
        }, 1000)
    }

    useEffect(() => {
        socketRef.current = io("http://localhost:3000")


        socketRef.current.on('connect', () => {
            socketRef.current?.emit('join-room', roomid)
            console.log('connected to socket io')
        })

        socketRef.current?.on('typing', (name: string) => {
            setTyping(`${name} is typing...`)
        })

        socketRef.current?.on('stop-typing', () => {
            setTyping(null)
        })

        socketRef.current.on('chat-message', (msg) => {
            setMessages((prv) => [...prv, msg])
        })

        return () => {
            // socket.off('chat-message')
            socketRef.current?.disconnect();
        }
    }, [])


    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return

        const newMessage: Message = {
            id: messages.length + 1,
            text: inputMessage,
            sender: name,
            name: name,
            timestamp: new Date(),
        }

        console.log(newMessage)
        socketRef.current?.emit('chat-message', { roomid, message: newMessage })
        setInputMessage("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">

                <div className="h-96 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.sender === name ? "justify-end" : "justify-start"}`}>
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === name ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                                    }`}
                            >
                                <p className="text-xs font-semibold mb-1 opacity-80">{message.name === name ? 'You' : message.name}</p>
                                <p className="text-sm">{message.text}</p>
                                <p className="text-xs opacity-70 mt-1">
                                    {new Date(message.timestamp).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    
                </div>
                    {typing && (
                        <div className="text-sm text-gray-400 px-4 pb-2">{typing}</div>
                    )}

                <div className="border-t border-gray-700 p-4">
                    <div className="flex space-x-3">
                        <Input
                            type="text"
                            value={inputMessage}
                            // onChange={(e) => setInputMessage(e.target.value)}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                            onClick={handleSendMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                            disabled={inputMessage.trim() === ""}
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chat
