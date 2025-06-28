import { Socket } from 'engine.io'
import express from 'express'
import http from 'http'
import {Server} from 'socket.io'


const app = express()
const server = http.createServer(app)
const io = new Server(server,{
    cors: {
        origin: 'http://localhost:5173'
    }
})


io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room',(roomid) => {
        socket.join(roomid)
        console.log(`user joined roomid: ${roomid}`);
    })

    socket.on('typing',({roomid,name}) =>{
        socket.to(roomid).emit('typing',name)
    })

    socket.on('stop-typing',(roomId) => {
        socket.to(roomId).emit('stop-typing')
    })

    socket.on('chat-message',(prop) => {
        io.to(prop.roomid).emit('chat-message',prop.message)
    });

    socket.on('disconnect',() => {
        console.log('a user disconnected')
    })
})


server.listen(3000, () => {
    console.log('server running on : http://localhost:3000')
})  