import React, { useEffect, useState, useReducer } from "react";

import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";

import { SEA } from "gun";

const currentState = {
    messages: []
}

const reducerHandler = (state, message) =>{
    return {
        messages: [message, ...state.messages]
    }
}


/* async function getSEAHandler(gunInstance, userInstance, setSeaChatRoom, roomUUIDObj, roomName){

    await gunInstance.get(roomUUIDObj.roomUUIDProperty).get("room_name").once(room => {
        userInstance.get("my_team_rooms").map(async data => {
            console.log(data.roomSEA);
            console.log(data.nameOfRoom);
            console.log(room)
            if(data.nameOfRoom == room){
                setSeaChatRoom(data.roomSEA);
            }
        })
    }); 
}
    */

/*     await gunInstance.get("memberList_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
        console.log(data);
    }) */

function RoomComponent({gunInstance, userInstance, roomUUIDObj}){
    let [isAddUserModalViewed, setIsAddUserModalViewed] = useState(false);

    //userReducer for chat
    const [stateMessages, dispatch] = useReducer(reducerHandler, currentState);

    let [roomName, setRoomName] = useState(''); // Holds room name
    let [roomUUIDState, setRoomUUID] = useState(''); // Holds room uuid-date
    let [seaChatRoom, setSeaChatRoom] = useState(''); // Holds the SEA pair of the chatroom
    let [myAlias, setMyAlias] = useState(''); //Display my username
    let [textMessage, setTextMessage] = useState(''); //Holds the user text input

    //save messages to gun
    async function sendMessage(){

        setTextMessage('');
        const messageObject = {
            name: myAlias,
            content: textMessage,
            timestamp: Date().substring(16, 21)
        }
        console.log(messageObject);
        let encryptedMessage = await SEA.encrypt(messageObject, seaChatRoom);
        console.log(roomUUIDState);

        await gunInstance.get("CHATROOM_".concat(roomUUIDState)).set(encryptedMessage);
  
    }


    // Remove duplicated messages from the "message" propery in the currentState.
    const filteredMessages = () => {
        console.log("filteredMessages function called")
        const formattedMessages = stateMessages.messages.filter((value, index) => {
        const _value = JSON.stringify(value)
        return (
            index ===
            stateMessages.messages.findIndex(obj => {
            return JSON.stringify(obj) === _value
            })
        )
        })

        return formattedMessages;
    }

    useEffect(()=>{
        console.log(roomUUIDObj.roomUUIDProperty);
        console.log(roomUUIDObj.roomName);

        setRoomUUID(roomUUIDObj.roomUUIDProperty);
        userInstance.get('alias').on(v => setMyAlias(v));

        setRoomName(roomUUIDObj.roomName);

        userInstance.get("my_team_rooms").map(async data => {
            console.log(data.roomSEA);
            console.log(data.nameOfRoom);
            console.log(roomUUIDObj.roomName);
            if(data.nameOfRoom == roomUUIDObj.roomName){
                setSeaChatRoom(data.roomSEA);

                //Read all messages from the chatroom
                gunInstance.get("CHATROOM_".concat(roomUUIDObj.roomUUIDProperty)).map().on(async encryptedMessage => {
                    console.log(encryptedMessage);

                    let decrypted = await SEA.decrypt(encryptedMessage, data.roomSEA);

                    console.log(decrypted);

                    dispatch( { name: decrypted.name, content: decrypted.content, timestamp: decrypted.timestamp } )
                })
            }
        });



    }, []);


    function showModal(){
        setIsAddUserModalViewed(true);
    }
    function hideModal(){
        setIsAddUserModalViewed(false);
    }
    function hideModalAfterCreatedRoom(){
        setIsAddUserModalViewed(false);
    }
    function submitEventHandler(event){
        if(event.key === "Enter" && textMessage.length){
            sendMessage();
        }
    }

    return (
        <div>
            {isAddUserModalViewed && <AddMemberModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} show={isAddUserModalViewed} handleCloseAfterMemberAdded={hideModalAfterCreatedRoom}></AddMemberModal>}
            <div className="top-toolbar-room">
                <button className="toolbar-btn-create-room" onClick={(e)=> {e.preventDefault(); showModal();}}>Add a user</button>
                <button className="toolbar-btn-create-room" >Upload a document</button>
            </div>
            <div className="room-top-container">

                <div className="grid-room">
                    <div className="header-box">
                        <h1>{roomName}</h1>
                    </div>
                    <div className="documents-list-container">

                    </div>

                    <div className="chatroom-container">
                        <main className="flexbox-chatbox">
                            <div className='messages'>
                                <ul>
                                    {filteredMessages().map((msg, index)=>
                                        <li className='message-item' key={index}>
                                            {/* For avatar */}
                                            {/* <img alt='avatar' src={msg.avatar} /> */}
                                            <div>
                                                <p><b className="username-box">{msg.name}</b> - {msg.content}</p>
                                            </div>
                                        </li>
                                    )}

                                </ul>
                            </div>
                            <div className='input-box'>
                                <input type="texbox-css" className="textbox-css" value={textMessage} placeholder='Type a message...' onKeyUp={e => {submitEventHandler(e)}} onChange={e => setTextMessage(e.target.value)} />
                                <button className="send-btn-css" onClick={sendMessage}>Send</button>
                            </div>
                        </main>
                    </div>


                    <div className="member-list-container">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomComponent;