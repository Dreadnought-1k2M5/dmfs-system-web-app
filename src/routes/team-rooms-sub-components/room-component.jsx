import React, { useEffect, useState, useReducer } from "react";

import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";
import UploadGroupModal from "../modal-components/UploadGroupModal";



import folderIcon from "../../icons/folder.png";

import { useNavigate } from "react-router-dom";


import { SEA } from "gun";

//Chat messages
const currentMsgState = {
    messages: []
}
const msgReducerHandler = (currentMsgState, message) =>{
    return {
        messages: [message, ...currentMsgState.messages]
    }
}

//Folders
const currentFolderState = {
    folders: []
}
const folderReducerHandler = (currentFolderState, folder) =>{
    return {
        folders: [folder, ...currentFolderState.folders]
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

function RoomComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let navigate = useNavigate();

    //userReducer for chat
    const [stateMessages, msgDispatch] = useReducer(msgReducerHandler, currentMsgState);

    //useReducer for folders
    const [stateFolders, folderDispatch] = useReducer(folderReducerHandler, currentFolderState )

    let [roomName, setRoomName] = useState(''); // Holds room name
    let [roomUUIDState, setRoomUUID] = useState(''); // Holds room uuid-date
    let [seaChatRoom, setSeaChatRoom] = useState(''); // Holds the SEA pair of the chatroom
    let [myAlias, setMyAlias] = useState(''); //Display my username
    let [textMessage, setTextMessage] = useState(''); //Holds the user text input

    //Upload modal component
    let [isUploadGroupModalViewed, setIsUploadGroupModalViewed] = useState(false);
    function showUploadGroupModal(){
        setIsUploadGroupModalViewed(true);
    }
    function hideUploadGroupModal(){
        setIsUploadGroupModalViewed(false);
    }

    //Add user modal component view
    let [isAddUserModalViewed, setIsAddUserModalViewed] = useState(false);
    function showModal(){
        setIsAddUserModalViewed(true);
    }
    function hideModal(){
        setIsAddUserModalViewed(false);
    }
    function hideModalAfterCreatedRoom(){
        setIsAddUserModalViewed(false);
    }

    //Enter event for chat messages.
    function submitEventHandler(event){
        if(event.key === "Enter" && textMessage.length){
            sendMessage();
        }
    }   

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


    // Remove duplicated messages from the "message" property in the currentMsgState.
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

    // Remove duplicated folder names from the "folders" property in the currentFolderState.
    const filteredFolders = () =>{
        console.log("filtered folders function called")
        const formattedFolderNames = stateFolders.folders.filter((value, index) => {
            console.log(value);
            const _value = JSON.stringify(value);
            return (
                index ===
                stateFolders.folders.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return formattedFolderNames;
    }

    useEffect(()=>{
        setRoomUUID(roomUUIDObj.roomUUIDProperty);
        userInstance.get('alias').on(v => setMyAlias(v));

        setRoomName(roomUUIDObj.roomName);

        userInstance.get("my_team_rooms").map(async data => {
            if(data.nameOfRoom == roomUUIDObj.roomName){
                setSeaChatRoom(data.roomSEA);

                //Read all messages from the chatroom
                gunInstance.get("CHATROOM_".concat(roomUUIDObj.roomUUIDProperty)).map().on(async encryptedMessage => {
                    let decrypted = await SEA.decrypt(encryptedMessage, data.roomSEA);
                    msgDispatch( { name: decrypted.name, content: decrypted.content, timestamp: decrypted.timestamp } )
                })
            }
        });

/*         let foldername;
        console.log("FOLDER");
        gunInstance.get("random folder 1".concat(roomUUIDObj.roomUUIDProperty)).map().once(async data =>{
            console.log(data);
        }) */

/*         console.log("VERSION CONTROL OF ONE FILE");
        gunInstance.get("vc_".concat("doc1test.txt").concat(roomUUIDObj.roomUUIDProperty)).map().once(data =>{
            console.log(data);
        }) */

        gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
            console.log(data);
            folderDispatch(data);
        })

        



    }, []);

    function navigateToFolder(folderName){
        folderContext.folderName = folderName;
        navigate("folder");
    }

    return (
        <div>
            <AddMemberModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} show={isAddUserModalViewed} handleCloseAfterMemberAdded={hideModalAfterCreatedRoom}></AddMemberModal>
            <UploadGroupModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideUploadGroupModal} show={isUploadGroupModalViewed} />
            <div className="top-toolbar-room">
                <div className="top-toolbar-nav-room-flex-container">
                    <button className="btn-navigate-room" onClick={() => navigate("/main/Teams")}>Team Rooms</button>
                    <button className="btn-navigate-room" onClick={(e)=> {e.preventDefault(); showModal();}}>Add a user</button>
                    <button className="btn-navigate-room" onClick={()=> showUploadGroupModal() }>Upload a document</button>
                </div>
            </div>

            
            <div className="room-top-container">
                <div className="documents-list-sidebar">
                    <div className="header-box">
                        <h2>{roomName}</h2>
                    </div>

                    <div className="folder-list-flex-container">
                        {filteredFolders().map((folder, index)=>
                            <div key={index} className="folder-item-css" onClick={() => navigateToFolder(folder)}>
                                <img src={folderIcon} height="33px" width="33px"></img>
                                <p>{folder}</p>
                            </div>
                        )}
                    </div>
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
    )
}

export default RoomComponent;