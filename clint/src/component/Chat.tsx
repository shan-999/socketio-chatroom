import React, { useEffect } from 'react'

import { useState } from "react"
import { useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { io, Socket } from 'socket.io-client';
import { Send, Users } from "lucide-react";

interface Message {
    id: number
    text: string
    sender: string
    name: string
    timestamp: Date
}

type MessageMap = { [key: string]: Message[] };

// const socket: Socket = io('http://localhost:3000');
interface ChatProps {
    name: string;
    roomid: string
}

const Chat = ({ name, roomid }: ChatProps) => {
    const [messages, setMessages] = useState<MessageMap>({})
    const [inputMessage, setInputMessage] = useState("")
    const [typing, setTyping] = useState<string | null>(null)
    const [userList, setUserList] = useState<{ name: string, socketId: string }[]>()
    const [selectedUser, setSelectedUser] = useState<string | null>(null)

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
            socketRef.current?.emit('join-room', { roomid, name })
            console.log('connected to socket io')
        })

        socketRef.current?.on('typing', (name: string) => {
            setTyping(`${name} is typing...`)
        })

        socketRef.current?.on('stop-typing', () => {
            setTyping(null)
        })

        // socketRef.current.on('chat-message', (msg) => {
        //     setMessages((prv) => [...prv, msg])
        // })

        socketRef.current.on('user-list', (users) => {
            console.log('users : ', users[0].sokcetId)
            setUserList(users.filter((u: any) => u.socketId !== socketRef.current?.id))
        })

        socketRef.current.on('privet-message', (data: { message: Message; from: string; toSocketId: string }) => {
            const { message, from, toSocketId } = data;

            const chatKey = buildChatKey(from,toSocketId)
            console.log("yeiiiiiiiiiiiiiiiiiii", message.name);
            setMessages(prev => ({
                ...prev,
                [chatKey]: [...(prev[chatKey] || []), message]
            }))
        });

        return () => {
            // socket.off('chat-message')
            socketRef.current?.disconnect();
        }
    }, [])

    const buildChatKey = (id1: string, id2: string) => {
        return [id1, id2].sort().join("-");
    };


    useEffect(() => {
        console.log("messages : ", messages)
    }, [messages])

    const handleSendMessage = () => {
        if (inputMessage.trim() === "") return

        const currentMessages = messages[selectedUser || ""] || [];
        const newMessage: Message = {
            id: currentMessages.length + 1,
            text: inputMessage,
            sender: name,
            name: name,
            timestamp: new Date(),
        }

        console.log(newMessage)
        // socketRef.current?.emit('chat-message', { roomid, message: newMessage })
        socketRef.current?.emit('privet-message', {
            toSocketId: selectedUser,
            message: newMessage,
            from: socketRef.current.id
        })

        setInputMessage("")
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage()
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
    }

    const chatKey = buildChatKey(socketRef.current?.id || "", selectedUser || "");

    return (
        <div className="min-h-screen bg-gray-900 flex">

            <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">

                <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center space-x-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        <h2 className="text-lg font-semibold text-white">Users</h2>
                        <span className="text-sm text-gray-400">({userList?.length || 0} online)</span>
                        <span className="text-sm text-gray-400">{name}</span>
                    </div>
                </div>


                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-2">
                        {userList?.map((user, index) => (
                            <div
                                key={index}
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                                onClick={() => setSelectedUser(user.socketId)}
                            >

                                <div className="relative">
                                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                        {getInitials(user.name)}
                                    </div>

                                    <div
                                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800 ${user.socketId ? "bg-green-500" : "bg-gray-500"
                                            }`}
                                    ></div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400">online</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                    <div className="h-96 overflow-y-auto p-4 space-y-4">
                        {messages[chatKey]?.map((message) => (
                                <div key={message.id} className={`flex ${message.sender === name ? "justify-end" : "justify-start"}`}>
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.sender === name ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
                                            }`}
                                    >
                                        <p className="text-xs font-semibold mb-1 opacity-80">
                                            {message.name === name ? "You" : message.name}
                                        </p>
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
                    {typing && <div className="text-sm text-gray-400 px-4 pb-2">{typing}</div>}
                    <div className="border-t border-gray-700 p-4">
                        <div className="flex space-x-3">
                            <Input
                                type="text"
                                value={inputMessage}
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
        </div>
    )
}

export default Chat
