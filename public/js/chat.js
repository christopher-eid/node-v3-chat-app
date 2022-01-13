//ackowledgments explanation
//  server(emit) -> client(receive) --aknowledgment --> server 
// client(emit) -> server(receive) --acknowledgment --> client




const socket = io() //to receive the socket object from io.on()

//HTML element
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input') //select input and button from INSIDE the form
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true}) //location.search is the arguments string in the URL, ignore... is used to ignore the '?' inside that string

socket.on('message', (message) => { //we receive the object contaning our text message and other info
    console.log(message)
    const html = Mustache.render(messageTemplate, { //we converted our message to a template and we pass to it the message we want to show
        passedUsername: message.username,
        passedMessage: message.text, //i gave name passedMessage inside template: look at index.html
        passedCreatedAt: moment(message.createdAt).format('h:mm a')
    }) 
    //we are inserting the message inside the div 'messages', we chose the option before end, means we add the html at the end of the div before </div> not after it
    $messages.insertAdjacentHTML('beforeend', html)
})


socket.on('locationMessage', (locationMessage)=> {
    console.log(locationMessage)
    const html = Mustache.render(locationMessageTemplate, {
        passedUsername: locationMessage.username,
        passedUrl: locationMessage.url,
        passedCreatedAt: moment(locationMessage.createdAt).format('h:mm a') 
    })
    $messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData',({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })
    document.querySelector('#sidebar').innerHTML = html
} )

$messageForm.addEventListener('submit', (event) => {
    event.preventDefault()

    //when the user submits a message, we have to disable the button until we get a acknwoledgment back that message was received or error.
    $messageFormButton.setAttribute('disabled', 'disabled') //button disabled
    
    const message = event.target.elements.message.value  //to take value of the input before the button ( '.message is the name of the input field I assigned, look at HTML : name="message")
    socket.emit('sendMessage', message, (ackMessage) => { //we can add a function as the last arguments, it will will be used to acknwloedge when message is received, we can call the ack from the server using callback()
      
        //enabling the button,  We also have to empty the text box and put the focus back to it (always do this AFTER receiving ack)
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(ackMessage){ //if an error occured when delivery message
            console.log(ackMessage)
        }else{
            console.log('Message delivered succesfully')
        }
    })

})

$locationButton.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by ur browser')
    }
    //disabling button
    $locationButton.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition((position)=> {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=> {
            //enabling button
            $locationButton.removeAttribute('disabled')

            console.log('Location shared!')
        })
    })
})


socket.emit('join', {username, room}, (error) => {//the third argument is a funtion that we will call from socket.on('join'..) in case we have an error
    if(error){
        alert(error)
        location.href = '/' // to send users to the homepage in case there is an error
    }
})












//EXAMPLE ON HOW TO USE SOCKET
// socket.on('countUpdated', (count)=> { //this function will run everytime the event countUpdated is received from server
//     console.log('count updated' , count)
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('Clicked')
//     socket.emit('increment')
// })

