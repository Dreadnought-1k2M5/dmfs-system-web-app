import React, { useEffect, useState, useReducer } from "react";

import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";
import UploadGroupModal from "../modal-components/UploadGroupModal";

import { Outlet, useNavigate } from "react-router-dom";

import folderIcon from "../../icons/folder.png";

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

//Members
const currentMemberListState = {
    membersArray: []
}
const memberListReducerHandler = (currentMemberListState, member) =>{
    return {
        membersArray: [member, ...currentMemberListState.membersArray]
    }
}

// useReducer for querying encrypted share
const currentNotificationListState ={
    notifications: []
  }
  
  const notificationListUseReducer = (currentNotificationListState, notification)=>{
    return {
        notifications: [notification, ...currentNotificationListState.notifications]
    }
  }

  // useReducer for querying share request
  const currentListShareRequestState ={
    listShareRequestArray: []
  }
  
  const listShareRequestHandler = (currentListShareRequestState, shareRequest)=>{
    return {
        listShareRequestArray: [shareRequest, ...currentListShareRequestState.listShareRequestArray]
    }
  }

function RoomComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let navigate = useNavigate();

    //useReducer for queued encrypted shares
    let [isTheresNotification, setNotification] = useState(false);
    let [isNotificationClicked, setIsNotificationClicked] = useState(false);
  
    let [notificationListState, dispatchNotification] = useReducer(notificationListUseReducer, currentNotificationListState);
    let [listShareRequest, dispatchListShareRequest] = useReducer(listShareRequestHandler, currentListShareRequestState);
  

    //useReducer for members
    const [stateMemberList, memberListDispatch] = useReducer(memberListReducerHandler, currentMemberListState);

    //userReducer for chat
    const [stateMessages, msgDispatch] = useReducer(msgReducerHandler, currentMsgState);

    //useReducer for folders
    const [stateFolders, folderDispatch] = useReducer(folderReducerHandler, currentFolderState )

    let [roomName, setRoomName] = useState(''); // Holds room name
    let [roomUUIDState, setRoomUUID] = useState(''); // Holds room uuid-date
    let [seaChatRoom, setSeaChatRoom] = useState(''); // Holds the SEA pair of the chatroom
    let [myAlias, setMyAlias] = useState(''); //Display my username
    let [textMessage, setTextMessage] = useState(''); //Holds the user text input
    
    //
    async function QueryNodeNetworkHandler(myAlias){
        await gunInstance.get("publicShareQueue".concat(roomUUIDObj.roomUUIDProperty)).map().on(data => {
          if(data.intendedUser === myAlias){
            console.log("TRUE. DISPATCHING NODE data");
            setNotification(true);
            dispatchNotification({
              intendedUser: data.intendedUser, 
              providedBy: data.providedBy, 
              providerEpub: data.providerEpub, 
              share: data.share, 
              filename: data.filename,
              roomUUID: data.roomUUID
            });
          }
        })
      }

       async function QueryShareRequestHandler(myAliasArg){
        console.log("TESTTTT");
        await gunInstance.get(myAliasArg.concat("publicNodeRequestList")).map().once(data => {
            console.log("TRUE. DISPATCHING NODE data");
            console.log(data);
            setNotification(true);
            dispatchListShareRequest({
                requestor: data.requestor,
                requestorEpub: data.requestorEpub,
                shareHolder: data.shareHolder,
                filename: data.filename
            });
        })
      } 


       //REMOVE DUPLICATED SHARED REQUESTS
      const filteredShareRequestList = () =>{
        console.log("filtered share request list notifications handler called");
        const filteredSharedRequestfArray = listShareRequest.listShareRequestArray.filter((value, index) => {
            const _value = JSON.stringify(value);
            return (
                index ===
                listShareRequest.listShareRequestArray.findIndex(obj => {
                return JSON.stringify(obj) === _value 
                })
            )
        })
    
        return filteredSharedRequestfArray;
      } 
    

      
  const filteredShareNotification = () =>{
    const filteredNotifArray = notificationListState.notifications.filter((value, index) => {
        const _value = JSON.stringify(value);
        return (
            index ===
            notificationListState.notifications.findIndex(obj => {
            return JSON.stringify(obj) === _value 
            })
        )
    })

    return filteredNotifArray;
  }

  
  async function decryptHandler(elemObj){
    alert("Please wait for a few moments as the decryption happens on the background");

    console.log(elemObj);
    //generate secret key
    let secretKey = await SEA.secret(elemObj.providerEpub, userInstance._.sea);
    console.log(secretKey)
    let decryptedShare = await SEA.decrypt(elemObj.share, secretKey);
    let shareNodeReference = userInstance.get(elemObj.filename.concat(myAlias)).put({
        fileName: elemObj.filename,
        encShareFile: decryptedShare,
        roomUUID: elemObj.roomUUID
    })

    //roomUUIDObj not elemObj.roomUUID
    await userInstance.get("documentsWithShares".concat(roomUUIDObj.roomUUIDProperty)).set(shareNodeReference);
    console.log("DECRYPTED SHARE");
    console.log(decryptedShare);

    //override data from public node queue
    await gunInstance.get("publicShareQueue".concat(roomUUIDObj.roomUUIDProperty)).get(elemObj.filename.concat(elemObj.intendedUser).concat(roomUUIDObj.roomUUIDProperty)).put({
        intendedUser: null,
        providedBy: null,
        providerEpub: null,
        share: null,
        filename: null,
        roomUUID: null
    })
    alert("SUCCESSFULLY OBTAINED THE SHARE INTO YOUR USER GRAPH!");
  }


    //State to track if room chat should be displayed or not
    let [viewRoomChat, setViewRoomChat] = useState(false);

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
        const formattedFolderNames = stateFolders.folders.filter((value, index) => {
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

    const filteredMemberList = () =>{
        console.log("filtered members function called")
        const formattedMemberList = stateMemberList.membersArray.filter((value, index) => {
            console.log(value);
            const _value = JSON.stringify(value);
            return (
                index ===
                stateMemberList.membersArray.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return formattedMemberList;
    }

    useEffect(()=>{
        userInstance.get("documentsWithShares".concat(roomUUIDObj.roomUUIDProperty)).map().once(data =>{
            console.log(data);
        })
        setRoomUUID(roomUUIDObj.roomUUIDProperty);
        userInstance.get('alias').on(v => {
            setMyAlias(v);
            QueryNodeNetworkHandler(v);
            QueryShareRequestHandler(v);
        });

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

        gunInstance.get("memberList_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data => {
            console.log(data);
            memberListDispatch({memberAlias: data.user_Alias});
        })

        gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
            console.log(data);
            folderDispatch(data);
        })

    }, []);

    async function authorizeShareHandler(elem1){

        userInstance.get(elem1.filename.concat(myAlias)).once(async data=>{
            //generate diffie helman
            let secretKey = await SEA.secret(elem1.requestorEpub, userInstance._.sea);
            let encryptedShare = await SEA.encrypt(data.encShareFile, secretKey);

            await gunInstance.get(elem1.requestor.concat("_").concat(myAlias).concat("responseNode")).put({
                isAuthorized: true,
                holderEpub: userInstance._.sea.epub,
                encryptedShare: encryptedShare
            })

            await gunInstance.get(myAlias.concat("publicNodeRequestList")).put({
                requestor: null,
                requestorEpub: null,
                shareHolder: null,
                filename: null
            })

        })

    }

    async function denyRequestHandler(){
        await gunInstance.get(myAlias.concat("publicNodeRequestList")).put({
            requestor: null,
            requestorEpub: null,
            shareHolder: null,
            filename: null
        })
    }

    return (
        <div>
            <AddMemberModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} show={isAddUserModalViewed} handleCloseAfterMemberAdded={hideModalAfterCreatedRoom}></AddMemberModal>
            <UploadGroupModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideUploadGroupModal} show={isUploadGroupModalViewed} />
            <div className="top-toolbar-room">
                <div className="top-toolbar-nav-room-flex-container-one">
                    <button className="btn-navigate-room" onClick={() => navigate("/main")}>Team Rooms</button>
                    <button className="btn-navigate-room" onClick={(e)=> {e.preventDefault(); showModal();}}>Add a user</button>
                    <button className="btn-navigate-room" onClick={()=> showUploadGroupModal() }>Upload a document</button>
                    <button className={ isTheresNotification ? "show-notif-css btn-navigate-room-selected" : "btn-navigate-room" }  onClick={() => setIsNotificationClicked(!isNotificationClicked)}>
                        Notification!
                    </button>
                    <button className={viewRoomChat ? "btn-navigate-room-selected" : "btn-navigate-room"} onClick={()=> setViewRoomChat(!viewRoomChat) }>Group Chat</button>
                </div>
{/*                 <div className="top-toolbar-nav-room-flex-container-two">
                    
                </div> */}
                <div className={isNotificationClicked ? "notification-box" : "notification-box-hidden"}>
                    <h3>Notification</h3>
                    {filteredShareNotification().map((elem, index)=>
                    <div className="notif-item-flexbox" key={index}>
                        <p className="p-notif-desc-css" >A secret share from {elem.providedBy} was assigned to you.</p>
                        <button className="notif-btn" onClick={()=> decryptHandler(elem)}>Decrypt</button>
                    </div>
                    )}
                    {filteredShareRequestList().map((elem1, index)=>                    
                    <div className="notif-item-flexbox" key={index}>
                        <p className="p-notif-desc-css" >{elem1.requestor} is requesting you provide the share for the document "{elem1.filename}"</p>
                        <div className="btn-flexbox-css-notif">
                            <button className="notif-btn" onClick={() => authorizeShareHandler(elem1)}>Authorize</button>
                            <button className="notif-btn" onClick={() => denyRequestHandler}>Deny</button>
                        </div>
                    </div>)

                    }
                </div>
            </div>

            
            <div className="room-top-container">
                <div className="documents-list-sidebar">
                    <div className="header-box">
                        <h2>{roomName}</h2>
                    </div>

                    <div className="folder-list-flex-container">
                        {filteredFolders().map((folder, index)=>
                            <div key={index} className="folder-item-css" onClick={() => {folderContext.folderName = folder; navigate("folder") } }>
                                {console.log(folder)}
                                <img src={folderIcon} height="33px" width="33px"></img>
                                <p>{folder}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="room-right-side-grid">

                    <div className="right-side-container">
                    </div>

                    <div className={viewRoomChat ? "chatroom-container" : "hide-chatroom-container"}>
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
                                    <textarea className="textarea-css" value={textMessage} placeholder='Type a message...' onKeyUp={e => {submitEventHandler(e)}} onChange={e => setTextMessage(e.target.value)} />
                                    <button className="send-btn-css" onClick={sendMessage}>Send</button>
                                </div>
                            </main>
                    </div>

                </div>

                {/* <div className="member-list-container">
                    <div className="member-list-box1">
                        <h3>Members</h3>

                    </div>
                    <div className="member-list-box2"> 
                        {filteredMemberList().map((member, index)=>
                            <p className="member-label-css" key={index}>{member.memberAlias}</p>
                        )}
                    </div>
                </div> */}
            </div>
        </div>
    )
}

export default RoomComponent;