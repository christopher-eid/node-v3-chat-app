//in this file we will define functions that are used while sending data in events

const generateMessage = (username, text) => {
    return{
        username, 
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, url) => {
    return{
        username,
        url,
        createdAt: new Date().getTime()
    }
}

module.exports ={
     generateMessage,
     generateLocationMessage
}