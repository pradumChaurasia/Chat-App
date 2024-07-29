const path=require('path') //node module
const http=require('http');
const express=require('express')
const dotenv = require('dotenv');
//load the socket.io library
const socketio=require('socket.io');

const {generateMessage,generateLocationMessage} =require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/user')
const Filter = require('bad-words')


dotenv.config();

const app = express()

//method on http library called createServer to create new server 
//and we passed it our express app(crating a server outside the http library
//to use the express app)

const server=http.createServer(app)

//create a new instance of socket.io to work(configure) with given server
const io=socketio(server) 


//setting up new express server
const port=process.env.PORT || 3001

const publicDirectoryPath=path.join(__dirname,'../public')//serve up th epublic directory

//use expressStatic midddleware to serve up the where would we in this directory
app.use(express.static(publicDirectoryPath)) 


// io/socket.brodocast.emit() is used to emit an event to all the available client expect the current client
//  

// let count=0 

//server (emit)=> client(recieve)->countUpdated
//client(emit)=> server(recieve)->increment

//to print a msg in a terminal when a given client connects
//we do this using io
//io.on-->listening for the given event to occur or allowing to run some code when a client gets connected
//''-->name of the event
//()=>{}-->func to run when an event occur
io.on('connection',(socket)=>{
    console.log("New websocket connection")

   
    
    socket.on('join',(options,callback)=>{

        //here user is indeed joining the room using socket.join
        //here we use addUser to start keeping track of them
        //since every  single connection has a unique id associated with it 

        const {error,user}=addUser({id:socket.id,...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message",generateMessage('Admin','Welcome!')) //to send(emit) the msg to particular connection
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
        callback()


        //socket.emit,io.emit,socket.broadcast.emit

        //io.to.emit, socket.broadcast.to.emit
    })


    //in this eventlistener we set up another parameter 
    //called callbackfunc and this this to acknowledge the event
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)


        const filter=new Filter()

        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message',generateMessage(user.username,message)) //this emit the event to all the connected client
        callback()
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })



    //when the given client gets disconnected we have other event and it is only used
    //in connection event 
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })

   
    // socket.emit('countUpdated',count)

    // socket.on('increment',()=>{ 
    //     count++
        // when we use socket.emit we are emitting the event to a particular connection
        // and in this econtext we dont want to emit to a singluar
        // connection ,instead we  want all the client gets the info.(means every conection that is acailable)
        //so we use io.emit() that is going to emit an emit to  every avaliable connection
        // 
    //     // socket.emit('countUpdated',count)
    //     io.emit('countUpdated',count)
    // })
})

server.listen(port,()=>{
    console.log(`listening on port ${port}`)
})