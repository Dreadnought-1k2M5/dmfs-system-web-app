import React, { useEffect, useState, useReducer } from "react";


import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";
import UploadGroupModal from "../modal-components/UploadGroupModal";

import { Outlet, useNavigate } from "react-router-dom";

import folderIcon from "../../icons/folder.png";
import folderIconSelected from "../../icons/folder-selected.png"

import FolderComponent from "./folder-component";

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
let currentStateFolderList = {
    folderListArray: []
  }
  
  const folderListReducerHandler = (currentStateFolderList, folder)=>{
    return {
      folderListArray: [folder, ...currentStateFolderList.folderListArray]
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

function SubfolderRender({element, handleSelectedFolderItem}){
    //let [isSubFolderSelectedState, setIsSubFolderSelectedState] = useState({isSelected: false, indexProp: null})
/* 
    console.log(isFolderSelectedState.isSelected);
    console.log(typeof setIsFolderSelectedState)
    element.map((data, index)=>{
        console.log(data);
    }) */

    return (
        <ul>
            {element.map((data, indexSub)=>
                <li key={indexSub}>
                    <div className={/* (isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === (indexSub + indexPropSub++)) ? "folder-item-css-active" :  */"folder-item-css"}  onClick={(e) => { handleSelectedFolderItem(e, data);} }>
                        <img src={/* (isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === (indexSub + indexPropSub++)) ? folderIconSelected : */ folderIcon} height="33px" width="33px"></img>
                        <p>{data.folderNameClean}</p>
                    </div>  
                    {data.itemsProp.length > 0 && <SubfolderRender element={data.itemsProp} handleSelectedFolderItem={handleSelectedFolderItem}/>}

                </li>
            )}
        </ul>


    )
}

function RoomComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let navigate = useNavigate();

    //to track which item is selected to apply the highlight css
    let [isFolderSelectedState, setIsFolderSelectedState] = useState({isSelected: false, indexProp: null})

    //to track which folder item or node to be rendered
    let [folderNameState, setFolderNameState] = useState(null);

    //useReducer for queued encrypted shares
    let [isTheresNotification, setNotification] = useState(false);
    let [isNotificationClicked, setIsNotificationClicked] = useState(false);
  
    let [notificationListState, dispatchNotification] = useReducer(notificationListUseReducer, currentNotificationListState);
    let [listShareRequest, dispatchListShareRequestNotification] = useReducer(listShareRequestHandler, currentListShareRequestState);
  

    //useReducer for members
    const [stateMemberList, memberListDispatch] = useReducer(memberListReducerHandler, currentMemberListState);

    //userReducer for chat
    const [stateMessages, msgDispatch] = useReducer(msgReducerHandler, currentMsgState);

    //useReducer for folders
    let [folderListState, dispatchFolderList] = useReducer(folderListReducerHandler, currentStateFolderList);
    let [folderListToRender, setFolderListToRender] = useState([]);

    let [roomName, setRoomName] = useState(''); // Holds room name
    let [roomUUIDState, setRoomUUID] = useState(''); // Holds room uuid-date
    let [seaRoomState, setSEAPairRoom] = useState(''); // Holds the SEA pair of the team room
    let [myAlias, setMyAlias] = useState(''); //Display my username
    let [textMessage, setTextMessage] = useState(''); //Holds the user text input
    
    
    useEffect(()=>{

        setRoomUUID(roomUUIDObj.roomUUIDProperty);
        userInstance.get('alias').on(v => {
            gunInstance.get(`${v}_requestSetNode`).map().on(data=>{
                setNotification(true);
                dispatchListShareRequestNotification(data);
            })
            setMyAlias(v);
            QueryNodeNetworkHandler(v);
            QueryShareRequestHandler(v);
        });

        setRoomName(roomUUIDObj.roomName);

        userInstance.get("my_team_rooms").map(async data => {
            if(data.nameOfRoom == roomUUIDObj.roomName){
                setSEAPairRoom(data.roomSEA);

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

/*         gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
            console.log(data);
            folderDispatch(data);
        }) */

        gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().once(async (data, key) =>{
            let objectItem = {
              folderNameNodeFull: null,
              folderNameClean: null,
              itemsProp: []
            }
            console.log("QWERTY---------QWERY----------------");
            console.log(data);
            dispatchFolderList(await traverseSubfolder(data, key, objectItem));
        })

    }, []);


    async function QueryNodeNetworkHandler(myAlias){

    }

    async function QueryShareRequestHandler(myAliasArg){
        
        await gunInstance.get(`${myAlias}_shareListNodeSet`).map().on(async data => {
            //Attempt to decrypt the encryptedShare

            //Generate Diffie–Hellman key exchange using my user graph SEA pair 
            //and the SEA pair of the team room.
            let secretKey = await SEA.secret(seaRoomState.epub, userInstance._.sea);
            let decryptedShare = await SEA.decrypt(data.encryptedShare, secretKey);
            
            setNotification(true);
            dispatchListShareRequestNotification({
                filename: data.filename,
                teamRoomUUID: data.teamRoomUUID,
                encryptedShare: data.encryptedShare1
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
        let encryptedMessage = await SEA.encrypt(messageObject, seaRoomState);
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
    const filteredFolderListHandler = () =>{
        const filteredFolderList = folderListState.folderListArray.filter((value, index) => {
            const _value = JSON.stringify(value);

            return (
                index ===
                folderListState.folderListArray.findIndex(obj => {

                    return JSON.stringify(obj) === _value 
                })
            )
        })
    
        return filteredFolderList;
    
    }
    async function traverseSubfolder(folderElemObj, key, objectItem){
          console.log("-----------------------Traversed-----------------------");
          console.log(key)
          objectItem.folderNameNodeFull = key;
          let substr1 = key.substring(0, key.indexOf("_sep_"));
          objectItem.folderNameClean = substr1.replaceAll('_', ' ');
        
          for (const key1 in folderElemObj) {
            if(key1.includes("_subfolder_")){
              let itemPropObject = {
                folderNameProp: key1,
                itemsProp: []
              }
        
        /*       console.log(key1) */
              await gunInstance.get(key1).once(async (data, key) =>{
                objectItem.itemsProp.push(await traverseSubfolder(data, key, itemPropObject));
              })
        
            }
          }
        return objectItem;
    }

    async function showFoldersHandler(event){
        event.preventDefault();
        console.log("----------------------------TEST SHOW FOLDER handler----------------------------");
        let arrayList = [];
          filteredFolderListHandler().map((element, index)=>{
            console.log("-----------------------------ITERATION (OUTER) -----------------------------")
            arrayList.push(element);
  
          })
  
          arrayList.forEach((data, index)=>{
            console.log(data.itemsProp.length);
          })
          setFolderListToRender(arrayList);
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

    async function authorizeShareHandler(elem1){
        alert("ALERT")
        await gunInstance.get(`${myAlias}_shareListNodeSet`).map().once(data =>{
            console.log(data);
        })

/*         userInstance.get(elem1.filename.concat(myAlias)).once(async data=>{
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

        }) */

    }

    async function denyRequestHandler(){
        await gunInstance.get(myAlias.concat("publicNodeRequestList")).put({
            requestor: null,
            requestorEpub: null,
            shareHolder: null,
            filename: null
        })
    }

    async function handleSelectedFolderItem(event, folder){
        event.preventDefault();

        setFolderNameState(folder);

/*         if(isFolderSelectedState.isSelected){
            setIsFolderSelectedState({isSelected: false, indexProp: null}); 
            setIsFolderSelectedState({isSelected: true, indexProp: index}); 
        }

        else{
            setIsFolderSelectedState({isSelected: true, indexProp: index}); 
        } */
    }

   
    return (
        <div>
            <AddMemberModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} show={isAddUserModalViewed} handleCloseAfterMemberAdded={hideModalAfterCreatedRoom}></AddMemberModal>
            <UploadGroupModal uuidRoomObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideUploadGroupModal} show={isUploadGroupModalViewed} />
            <div className="top-toolbar-room">

                <div className="top-toolbar-nav-room-flex-container-one">
                    <button className="btn-navigate-room" onClick={() => navigate("/main")}>Team Rooms</button>
                    <button className="btn-navigate-room" onClick={(e)=> {e.preventDefault(); showModal();}}>Add a user</button>
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

            
            <div className="room-top-container">
                <div className="documents-list-sidebar">
                    <div className="header-box">
                        <h2>{roomName}</h2>
                    </div>
                    <div className="toolbar-upload-group-box">
                        <button className="btn-upload-group-css" onClick={()=> showUploadGroupModal() }>Upload a document</button>
                        <button className="btn-upload-group-css" onClick={(e)=> showFoldersHandler(e) }>Show Documents</button>

                    </div>
                    <div className="folder-list-tree-container">
                        <ul> 
                                {folderListToRender.map((elem, index)=>
                                    <li key={index} >
                                        <div className={/* (isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? "folder-item-css-active" :  */"folder-item-css"}  onClick={(e) => { handleSelectedFolderItem(e, elem);} }>
                                            <img src={(isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? folderIconSelected : folderIcon} height="33px" width="33px"></img>
                                            <p>{elem.folderNameClean}</p>
                                        </div>
                                        
                                        {console.log("parent index")}
                                        {console.log(index)}
                                        {elem.itemsProp.length > 0 && <SubfolderRender element={elem.itemsProp} handleSelectedFolderItem={handleSelectedFolderItem} />}

                                    </li>
                                )}
                        </ul>
                    </div>
                </div>

                <div className="room-right-side-grid">
                    <div className="right-side-container">

                        {folderNameState != null && <FolderComponent gunInstance={gunInstance} userInstance={userInstance} roomUUIDObj={roomUUIDObj} folderContext={folderNameState}/>
}
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