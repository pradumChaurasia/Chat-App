
//we call the function io() to connect to the server ,now we can see the msg on terminal
// io()

//Elements
const $messageForm=document.querySelector('#message-form');
const $messageFormInput =$messageForm.querySelector('input');
const $messageFormButton=$messageForm.querySelector('button');


//Selectors for sendLocation button
const $sendLocationButton=document.querySelector('#send-location');


const $messages=document.querySelector('#messages');

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML;
const locationMessageTemplate=document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML;

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{
    //get new message element
    const $newMessage=$messages.lastElementChild

    //get height of the new message and margin value
    //and take the margin and added on the height of the msg
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)

    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

    // console.log(newMessageMargin)
    //Visible height
    const visibleHeight=$messages.offsetHeight

    //height of messages constainer
    const constainerHeight=$messages.scrollHeight

    //how far have i scroll
    const scrollOffset = $messages.scrollTop+visibleHeight

    if(constainerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}
 
const socket=io()
// socket.on('countUpdated',(count)=>{
//     console.log('count has been updated',count)
// }) 

// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked')
//     socket.emit('increment')


// }) 

  
//to listen for the msg   from the server
socket.on('message',(message)=>{
    console.log(message)

    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//selecting the template from js and render the templates
//with the url and append to the message list
socket.on('locationMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})


socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable the form once it is submitted
    $messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        //enable the form 
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }

        console.log('The message was delivered')
    })//this is emitted from the client and recieve by the server

}) 

// event acknowledgemnet is the acknowledgement that a client getting notified that the event is getting processed 
// and it is provided as a last argument in the code

$sendLocationButton.addEventListener('click',()=>{
    if (!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }

    //disable location just before the current position
    $sendLocationButton.setAttribute('disabled', 'disabled')


    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position)
        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        }, ()=>{
            //Enable the sendLocation button in teh acknowledge callbacks 
            $sendLocationButton.removeAttribute('disabled')
            console.log('Location shared!')
        })

    })

   
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})