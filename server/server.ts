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

interface User{
    roomid: string,
    name: string
}

const users:{[key:string] : User} = {}

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room',({roomid,name}) => {
        socket.join(roomid)
        users[socket.id] = {name,roomid}
        sendUsers(roomid)
        console.log(`user joined roomid: ${roomid}`);
    })

    socket.on('typing',({roomid,name}) =>{
        socket.to(roomid).emit('typing',name)
    })

    socket.on('stop-typing',(roomId) => {
        socket.to(roomId).emit('stop-typing')
    })

    // socket.on('chat-message',(prop) => {
    //     io.to(prop.roomid).emit('chat-message',prop.message)
    // });

    socket.on('privet-message',({toSocketId,message,from}) => {
        // console.log('iii :', toSocketId, message, from)
        io.to(toSocketId).emit('privet-message',{message,from, toSocketId})
        socket.emit('privet-message', { message, from ,toSocketId});
        
    })

    socket.on('disconnect',() => {
        const user = users[socket.id]
        if(user){
            const roomid = user.roomid
            delete users[socket.id]
            sendUsers(roomid)
        }
        console.log('a user disconnected')
    })


    function sendUsers(roomid:string) {
        const roomUsers = Object.entries(users).filter(([_,user]) => user.roomid === roomid).map(([socketId,user]) => ({socketId,name:user.name}))
        io.to(roomid).emit('user-list',roomUsers)
    }
})


server.listen(3000, () => {
    console.log('server running on : http://localhost:3000')
})  