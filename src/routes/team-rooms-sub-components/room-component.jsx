import React, { useEffect, useState, useReducer } from "react";


import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";
import UploadGroupModal from "../modal-components/UploadGroupModal";

import { Outlet, useNavigate } from "react-router-dom";

import folderIcon from "../../icons/folder.png";
import folderIconSelected from "../../icons/folder-selected.png"

import FolderComponent from "./folder-component";

import { SEA } from "gun";

import search from '../../icons/search-icon.png'

import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'


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


    // useReducer for search list items
const currentSearchListState ={
    searchListState: []
}
    
const searchListItemsHandler = (currentSearchListState, shareRequest)=>{
    return {
        searchListState: [shareRequest, ...currentSearchListState.searchListState]
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

    //useReducer for a list of search items
    let [searchItemsListState, dispatchSearchItemsListState] = useReducer(searchListItemsHandler, currentSearchListState);


    let [roomName, setRoomName] = useState(''); // Holds room name
    let [roomUUIDState, setRoomUUID] = useState(''); // Holds room uuid-date
    let [seaRoomState, setSEAPairRoom] = useState(''); // Holds the SEA pair of the team room
    let [myAlias, setMyAlias] = useState(''); //Display my username
    let [textMessage, setTextMessage] = useState(''); //Holds the user text input
    let [selectedSearchItemState, setSelectedSearchItemState] = useState(null);
    

    //state for clicking notification - the purpose is to rerender the component to update the frontend
    let [renderComponentState, setRenderComponentState] = useState(false);
    //State to track if room chat should be displayed or not
    let [viewRoomChat, setViewRoomChat] = useState(false);
    //state for holding user input from the search bar
    const [inputFilenameState, setinputFilenameState] = useState("");
    //state to check if the upload modal component is being viewed 
    let [isUploadGroupModalViewed, setIsUploadGroupModalViewed] = useState(false);
    //Add user modal component view
    let [isAddUserModalViewed, setIsAddUserModalViewed] = useState(false);



    useEffect(()=>{

        setRoomUUID(roomUUIDObj.roomUUIDProperty);

        userInstance.get('alias').once(async v => {
            setMyAlias(v)
            //Listen to notifications except for secret share request
            console.log("HGHGHGHGHG")
            await gunInstance.get(`${v}_generalPublicNotificationNode`).map().on(data =>{
                console.log(data);
                console.log("HGHGHGHGHG")
                //filter out individual nodes that have null values
                if(data.message != null && data.date != null){
                    setNotification(true);
                    dispatchNotification(data);
                }
            })

            await gunInstance.get(`${v}_requestSetNode`).map().on(data=>{
                //filter out individual nodes that have null values
                if(data.requestor != null){
                    setNotification(true);
                    dispatchListShareRequestNotification(data);
                }

            })
            await gunInstance.get(`${roomUUIDObj.roomUUIDProperty}_nodeSearchItemsSet`).map().on(data => {
                console.log(data);
                if(data.filenameProperty != null || data.CID_prop != null || data.location != null || data.iv != null || data.fileKey != null){
                    dispatchSearchItemsListState({
                        filenameProperty: data.filenameProperty, 
                        filenameWithNoWhiteSpace: data.filenameWithNoWhiteSpace,
                        CID_prop: data.CID_prop, 
                        fileKey: data.fileKey, 
                        iv: data.iv, 
                        fileType: data.fileType,
                        date: data.date,
                        uploadedBy: data.uploadedBy,
                        accessType: data.accessType,
                        location: data.location
                    })
                }

            })
            
            setMyAlias(v);
        });

        setRoomName(roomUUIDObj.roomName);

        userInstance.get("my_team_rooms").map().on(async data => {
            if(data.nameOfRoom == roomUUIDObj.roomName){
                setSEAPairRoom(JSON.parse(data.roomSEA));
                console.log(data);
                console.log(JSON.parse(data.roomSEA))
                //Read all messages from the chatroom
                gunInstance.get("CHATROOM_".concat(roomUUIDObj.roomUUIDProperty)).map().on(async encryptedMessage => {
                    //For some reason
                    console.log(data.roomSEA);
                    console.log(typeof data.roomSEA);
                    
                    let decrypted = await SEA.decrypt(encryptedMessage, JSON.parse(data.roomSEA));
                    console.log(decrypted);
                    msgDispatch( { name: decrypted.name, content: decrypted.content, timestamp: decrypted.timestamp } )
                })
            }
        });

/*         userInstance.get('alias').on(async myAlias =>{
            console.log(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`);

            userInstance.get("my_team_rooms").map(async data => {
                if(data.nameOfRoom == roomUUIDObj.roomName){
                    let seaPairRoomPropParsed = data.roomSEA;
                    //console.log(seaRoomState);
                    gunInstance.get(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`).map().on(async data =>{
                        console.log(data);
                        if(data.grantor != null && data.encryptedShare != null){
                            //Reconstrucct the key and decrypt
                            let decryptedShare = await SEA.decrypt(data.encryptedShare, await SEA.secret(seaPairRoomPropParsed.epub, userInstance._.sea));
                            dispatchResponse({decryptedShare: decryptedShare, holderAlias: data.grantor});
                        }
                    })
                }
            })

        }) */

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

            memberListDispatch({memberAlias: data.user_Alias});
        })

/*         gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
            console.log(data);
            folderDispatch(data);
        }) */

        gunInstance.get("foldersMetadata_".concat(roomUUIDObj.roomUUIDProperty)).map().on(async (data, key) =>{
            let objectItem = {
              folderNameNodeFull: null,
              folderNameClean: null,
              itemsProp: []
            }

            dispatchFolderList(await traverseSubfolder(data, key, objectItem));
        })

    }, []);

    //REMOVE DUPLICATED SHARED REQUESTS
    const filteredShareRequestList = () =>{
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
    
    const filteredNotificationHandler = () =>{
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

  
  async function RemoveNotificationHandler(elemObj){
    await gunInstance.get(`${myAlias}_generalNotificationItem_${elemObj.date}`).put({
        message: null,
        date: null
    })
    let index = notificationListState.notifications.indexOf(elemObj);
    notificationListState.notifications.splice(index, 1);
    setRenderComponentState(!renderComponentState);
    setNotification(false);

  }


    function showUploadGroupModal(){
        setIsUploadGroupModalViewed(true);
    }

    function hideUploadGroupModal(){
        setIsUploadGroupModalViewed(false);
    }


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
        console.log(seaRoomState);
        console.log(typeof seaRoomState);
        let encryptedMessage = await SEA.encrypt(messageObject, seaRoomState);

        await gunInstance.get("CHATROOM_".concat(roomUUIDState)).set(encryptedMessage);
  
    }

    // Remove duplicated messages from the "message" property in the currentMsgState.
    const filteredMessages = () => {
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
              await gunInstance.get(key1).on(async (data, key) =>{
                objectItem.itemsProp.push(await traverseSubfolder(data, key, itemPropObject));
              })
        
            }
          }
        return objectItem;
    }

    async function showFoldersHandler(event){
        event.preventDefault();
        let arrayList = [];
          filteredFolderListHandler().map((element, index)=>{
            arrayList.push(element);
  
          })
  
/*           arrayList.forEach((data, index)=>{
            console.log(data.itemsProp.length);
          }) */
          setFolderListToRender(arrayList);
    }
        

    const filteredMemberList = () =>{
        const formattedMemberList = stateMemberList.membersArray.filter((value, index) => {
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

    async function authorizeShareHandler(event, elemObjRequest){
        //setRenderComponentState(!renderComponentState);

        //event.preventDefault();
        alert("Authorizing.");
        await gunInstance.get(`${elemObjRequest.filename}_${myAlias}_requestItem_${elemObjRequest.date}`).on(async data =>{

            console.log(seaRoomState);
            console.log(typeof seaRoomState);
            console.log(elemObjRequest);
            console.log(typeof elemObjRequest);
            console.log(elemObjRequest.encShare);

            //reconstruct the correct secret key and decrypt the encrypted Share
            let decryptedShare = await SEA.decrypt(elemObjRequest.encShare, await SEA.secret(seaRoomState.epub, userInstance._.sea));
            console.log(decryptedShare);
            
            //Construct key and encrypt the share which can only be decypted by the requestor
            let encryptedShare = await SEA.encrypt(decryptedShare, await SEA.secret(elemObjRequest.requestorEpub, seaRoomState));

            //Individual node indicating a authorization response to the requestor
            let dateJSON = new Date().toJSON();
            await gunInstance.get(`${elemObjRequest.filename}_${elemObjRequest.requestor}_responseItem_${dateJSON}`).put({
                grantor: myAlias,
                encryptedShare: encryptedShare,
                date: dateJSON,
            })

            //node reference
            let nodeResponseRef = await gunInstance.get(`${elemObjRequest.filename}_${elemObjRequest.requestor}_responseItem_${dateJSON}`);

            console.log(`responseNodeSet_${elemObjRequest.requestor}_${roomUUIDObj.roomUUIDProperty}`);
            await gunInstance.get(`responseNodeSet_${elemObjRequest.requestor}_${roomUUIDObj.roomUUIDProperty}`).set(nodeResponseRef);


            await gunInstance.get(`${elemObjRequest.filename}_${myAlias}_requestItem_${elemObjRequest.date}`).put({
                requestor: null, 
                filename: null,
                requestorEpub: null,
                encShare: null,
                date: null
            })

            let index = listShareRequest.listShareRequestArray.indexOf(elemObjRequest);
            listShareRequest.listShareRequestArray.splice(index, 1);
            setRenderComponentState(!renderComponentState);
            setNotification(false);
        })


    }

    async function denyRequestHandler(){
/*         await gunInstance.get(myAlias.concat("publicNodeRequestList")).put({
            requestor: null,
            requestorEpub: null,
            shareHolder: null,
            filename: null
        }) */
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

    const filteredSearchItemsListHandler = () =>{
        const filteredSearchListItemsArray = searchItemsListState.searchListState.filter((value, index) => {
            console.log(value);
            const _value = JSON.stringify(value);
            return (
                index ===
                searchItemsListState.searchListState.findIndex(obj => {
                return JSON.stringify(obj) === _value 
                })
            )
        })
        console.log(filteredSearchListItemsArray);
        return filteredSearchListItemsArray;
    }


    async function inputFilenameHandler(e){
        var lowerCase = e.target.value.toLowerCase();
        setinputFilenameState(lowerCase);
    }

    //List Component to display search result
    function List({prop}) {
        //create a new array by filtering the original array
        const filteredData = filteredSearchItemsListHandler().filter((elementObj) => {
            //if no input the return the original
            if (prop === '') {
                return '';
            }
            //return the item which contains the user input
            else {
                return elementObj.filenameProperty.toLowerCase().includes(prop)
            }
        })
        return (
            <ul className="ul-suggestion-container">
                {filteredData.map((item, index) => (
                    <li className="search-item-li" key={index} onClick={() =>{ setSelectedSearchItemState(item); setinputFilenameState("") } }>
                        {console.log(item)}
                        <img className="icon-size-small" src={ (item.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (item.fileType === "application/pdf") ? pdf : file } />
                        <p className="filename-item-css">{item.filenameProperty}</p>
                    </li>
                ))}
            </ul>
        )
    }
   
    async function handleDownloadShare(){
        if(selectedSearchItemState == null){
            return
        }
        await gunInstance.get(`${selectedSearchItemState.filenameProperty}${roomUUIDObj.roomUUIDProperty}`).once(async data =>{
            let filename = data.filenameProperty;
            let filenameWithNoWhiteSpace = data.filenameWithNoWhiteSpace;
            let CID = data.CID_prop;
            let fileType = data.fileType;
            
            //Get the SEA pair of the team room
            //SEAState value is in JSON format, parse it.
            let parsedSEAState = seaRoomState;

            //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
            let decryptedIVBase64 = await SEA.decrypt(data.iv, parsedSEAState);
            const decodedb64Uint8Array  = window.atob(decryptedIVBase64); //Decode base64-encoded string back into Uint8Array
            const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
            const ivUint8Array = new Uint8Array(buffer);
            for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
            }


            //Decrypt the parsedExportedKey using the SEA.pair() of the team room.
            let decryptedKey = await SEA.decrypt(data.fileKey, parsedSEAState);
            console.log(decryptedKey);
            //Idk why the fuck this line doesn't work but the decryption process works without it.
            //The value of 'decryptedKey' was supposed to be a JSON string, but it wasn't for some reason.
            //let jsonParseFileKey = await JSON.parse(decryptedJSON);

            await crypto.subtle.importKey("jwk", decryptedKey, { 'name': 'AES-CBC' }, true, ['encrypt', 'decrypt']).then(cryptoKeyImported =>{
                fetch(`https://${CID}.ipfs.w3s.link/ipfs/${CID}/${filenameWithNoWhiteSpace}`).then(res => {
                    let result = res.blob(); // Convert to blob() format
                    console.log(result);
                    return result;
                }).then(async res => {
            
                    // Convert blob to arraybuffer
                    const fileArrayBuffer = await new Response(res).arrayBuffer();
        
                    await window.crypto.subtle.decrypt({name: 'AES-CBC', iv: ivUint8Array}, cryptoKeyImported, fileArrayBuffer).then(decrypted => {
                        //Convert ArrayBuffer to Blob and Download
                        const blob = new Blob([decrypted], {type: fileType} ) // convert decrypted arraybuffer to blob.
                        const aElement = document.createElement('a');
                        aElement.setAttribute('download', `${filename}`);
                        const href = URL.createObjectURL(blob);
                        aElement.href = href;
                        aElement.setAttribute('target', '_blank');
                        aElement.click();
                        URL.revokeObjectURL(href);
            
                    }).catch(console.error);
                    
                })
            
            })
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
                    <button className={ isTheresNotification ? "show-notif-css btn-navigate-room-selected" : "btn-navigate-room" }  onClick={() => setIsNotificationClicked(!isNotificationClicked)}>
                        Notification!
                    </button>
                    <button className={viewRoomChat ? "btn-navigate-room-selected" : "btn-navigate-room"} onClick={()=> setViewRoomChat(!viewRoomChat) }>Group Chat</button>
                </div>
{/*                 <div className="top-toolbar-nav-room-flex-container-two">
                    
                </div> */}
                <div className={isNotificationClicked ? "notification-box" : "notification-box-hidden"}>
                    <h3>Notification</h3>
                    {filteredNotificationHandler().map((elem, index)=>
                    <div>
                        {elem.message != null && 
                            <div className="notif-item-flexbox" key={index}>
                                <p className="p-notif-desc-css" >{elem.message}</p>
                                <button className="notif-btn" onClick={()=> {RemoveNotificationHandler(elem); }}>Got it!</button>
                            </div>
                        }
                    </div>

                    )}
                    {filteredShareRequestList().map((elem1, index)=> 
                        <div>
                            { elem1.requestor != null &&
                                <div className="notif-item-flexbox" key={index}>
                                    <p className="p-notif-desc-css" >{elem1.requestor} is requesting you provide the share for the document "{elem1.filename}"</p>
                                    <div className="btn-flexbox-css-notif">
                                        <button className="notif-btn" onClick={(e) => authorizeShareHandler(e, elem1)}>Authorize</button>
                                        <button className="notif-btn" onClick={(e) => denyRequestHandler}>Deny</button>
                                    </div>
                                </div>
                            }
                        </div>                  
                    )}
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

                        {folderNameState != null && <FolderComponent gunInstance={gunInstance} userInstance={userInstance} roomUUIDObj={roomUUIDObj} folderContext={folderNameState}/>}
                        {folderNameState == null && 
                            <div className="top-nav-bar-right-side">
                                <div className="search-box-room">
                                        <input type="text" placeholder='Search Shared Documents' value={inputFilenameState} onChange={(e) => inputFilenameHandler(e)}/>
                                        <img src= {search} alt="" className='search-icon-room'/>
                                </div>

                                <div className="suggestion-box-search" >
                                    <List prop={inputFilenameState} />
                                </div>

                            </div>
                        }
                        {selectedSearchItemState != null && 
                            <div className="selected-file-details-container">
                                <div className="table-container-div-document-metadata">
                                    <table>
                                        <tr>
                                            <td>
                                                <p>File Name: </p>
                                            </td>
                                            <td>
                                                <p>{selectedSearchItemState.filenameProperty}</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Content Identifier (CID): </td>
                                            <td>{selectedSearchItemState.CID_prop}</td>
                                        </tr>
                                        <tr>
                                            <td>Created / Modified: </td>
                                            <td>{selectedSearchItemState.date}</td>
                                        </tr>
                                        <tr>
                                            <td>Folder / Archive: </td>
                                            <td>{selectedSearchItemState.location}</td>
                                        </tr>
                                    </table>
                                </div>

                                <div className="icon-download-btn-box">
                                    <img className="icon-size-large" src={ (selectedSearchItemState.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (selectedSearchItemState.fileType === "application/pdf") ? pdf : file } />
                                    <button className="download-btn-css-document-metadata" onClick={handleDownloadShare}>Download Shared Document</button>
                                </div>

                            </div>
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