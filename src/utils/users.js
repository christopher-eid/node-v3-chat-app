const users = []

const addUser = ({id, username, room})=> {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }
   
    //check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username //if a user with the same name already exists IN THE SAME ROOM
    })

    if(existingUser){
        return{
            error:'Username is in use!'
        }
    }

    //Store user


    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}

const removeUser = (id) => {
    const index = users.findIndex( (user)=> {
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index, 1)[0] //we remove starting from an index - we specified only 1 user in our case
                                        //we then put [0] to return the first element removed which is our only in our case
                                        //we could have done the same using filter but filter would keep running even after finding a match so splice is better
    }
}

const getUser = (id) => {
    //.find returns a match if we have or undefined if we dont find
    return users.find( (user) => {
        return user.id === id
    })
}

const getUsersInRoom = (room) => {
     room = room.trim().toLowerCase()
    return users.filter( (user) => {
       return user.room == room
    })
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}

// addUser({// testing our files
//     id: 22,
//     username: 'andrew',
//     room: 'South philly'
// })

// addUser({
//     id: 42,
//     username: 'mike',
//     room: 'South philly'
// })


// addUser({
//     id:32,
//     username: 'andrew',
//     room: 'center city'
// })
// console.log(users)

// const res = addUser({
//     id:33,
//     username:'andrew',
//     room: 'South philly'
// })
// console.log(res)
// console.log('------------REMOVING USER--------------')
// const removedUser = removeUser(22)
// console.log(removedUser)
// console.log(users)

// console.log('-------------finding user----------')
// const user = getUser(42)
// console.log(user)

// console.log('------Finding users in room-------')
// const userList = getUsersInRoom('center city')
// console.log(userList)