const users=[]


const addUser=({id,username,room})=>{
     //clean the data
     username=username.trim().toLowerCase()
     room=room.trim().toLowerCase()

     //validate the data
     if(!username || !room){
        return {
            error:'Username and room are required'
        }
     }

     //Check for existing user
     const existingUser=users.find((user)=>{
        return user.room===room && user.username===username
     })

     //Validate username
     if(existingUser){
        return {
            error:'Username is in use!'
        }
     }

     //Store user
     const user={id,username,room}
     users.push(user)
     return {user}
}

//it takes the id of the user to remove,we would find them in an array and
//if we find them we would remove them

const removeUser=(id)=>{
    //here array method we use is findIndex(),it instead of array item 
    //back we get the position of the array item
    const index=users.findIndex((user)=>user.id === id)

    
    if (index!==-1){

        //return the user we removed by using users.slice ,it allows
        //to remove the user by their index here second argument is the 
        //number of item we would like to remove and it return an array 
        
        return users.splice(index, 1)[0]
    }
}

const getUser=(id)=>{
    return users.find((user)=>user.id === id)
}

const getUsersInRoom = (room)=>{
    room=room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}


// addUser({
//     id:22,
//     username:'Rishu', 
//     room:'123'
// })
// addUser({
//     id:42,
//     username:'Pradum',
//     room:'123'
// })
// addUser({
//     id:32,
//     username:'Pradum',
//     room:'Center City'
// })

// console.log(users)

// const user=getUser(42)

// console.log(user)

// const userList=getUsersInRoom('123')
// console.log(userList)

// const removedUser=removeUser(22)

// console.log(removedUser)

// const res=addUser({
//     id:33,
//     username:'Rishu',
//     room:'123'
// })
// console.log(res)

module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}