const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users') //the users array is located in that file

const app = express()
const server = http.createServer(app) // this method is done implicitely by express, we are just modifying our code for websocket
const io = socketio(server) //we used the server we created to make it support websockets 

app.use(express.json())

const port = process.env.PORT || 3000

const fileDirectory = path.join(__dirname, '../public')


app.use(express.static(fileDirectory))

let count = 0 

// for events in  general: socket.emit, io.emit, socket.broadcast.emit
// for events with rooms:               io.to.emit, socket.broadcast.to.emit

io.on('connection', (socket) => { // it will run everytime a new user connected to the server, runs everytime 'connection event' is found, connection is a built in event
    console.log('New websocket connection')

    // socket.emit('message', generateMessage('Hello!')) //function generateMessage is in utils/messages.js, we return an object containing all the info we want(message, time..)
    // socket.broadcast.emit('message', generateMessage('a new user has joined')) //to emit the event to all browsers except the one that has fired the event

    socket.on('join', ({username, room}, callback)=> {
        const{error, user} = addUser({id: socket.id, username, room}) //use this method to fill the array in the utils/users file, it returns either the object added or error
        

        if(error) { //if user was not added 
            callback(error)
        }else{
            //use user.room, user.interface bcz the inputs username and room have been trimmed and lowercased inside addUser()
        socket.join(user.room)
        socket.emit('message', generateMessage('Admin','Hello!')) //function generateMessage is in utils/messages.js, we return an object containing all the info we want(message, time..)
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined!`)) //to emit the event to all browsers except the one that has fired the event    
       
        //users in the room: send users to all users in the room including me
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
       
       
        callback() //we have no error
    }
    })

    socket.on('sendMessage', (message, callback) => { //callback is the acknowledgment function
       const user = getUser(socket.id)
       
        const filter = new Filter()
        if(filter.isProfane(message)){ //we dont send the message if bad words detected
            callback('Profanity is not allowed - no bad words')
        }else{
            io.to(user.room).emit('message', generateMessage(user.username, message)) //send the event to all users including the one who browser on which i am
            callback() //to call the acknowledgment of this event, here we did not send a message back in the arguments
        }
    })


    socket.on('disconnect', ()=> { //disconnect is a built it event, it is fired when a user disconnects
       const user = removeUser(socket.id) //it will return either removed user or undefined
        if(user){ //if only we found a user to delete, we display a message
           // io.emit('message', generateMessage('A user has left'))
           io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`))
        
            //users in the room: send users to all users in the room including me
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        }
    })


    socket.on('sendLocation', (locationObject, callback)=> {
        const user = getUser(socket.id)

        const googleMapsLink = `https://google.com/maps?q=${locationObject.latitude},${locationObject.longitude}`
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, googleMapsLink))
        
        callback()
    })


// EXAMPLE ON HOW TO SEND AND RECEIVE EVENTS
//     socket.emit('countUpdated', count)    //we are sending an event from the server
//                                     //we name the event like we want
//                                     //do not forget to changes in client side

//                                     //the second argument can be accessed from the callback function on the client side in the function socket.on()



//     socket.on('increment', ()=> {
//         count++
//        // socket.emit('countUpdated', count): when a user updates the count, we want the change to appear to ALL connected users, so we had to use:
//         //so we emit the event to every connection instead of doing it for a specific socket
//        io.emit('countUpdated', count)
//     })

    })


server.listen(port, () => { //PUT SERVER.LISTEN not APP.LISTEN
    console.log('Server is up on port' + port)
})