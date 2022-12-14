import React from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { useNavigate } from "react-router-dom";


export default function CreateRoom({ roomUUIDObj, gunInstance, userInstance, handleClose, show}){
    let [groupName, setGroupName] = useState('');
    let [groupUUID, setGroupUUID] = useState('');
    let [seaChatObj, setseaChatObj] = useState({});
    const navigate = useNavigate();

    const toggleClassname = show ? "modal-create-room modal-create-room-container" : "modal-create-room display-none";

    async function generateUUID(){
        let uuidv4String = uuidv4();
        uuidv4String = uuidv4String.replaceAll("-", "_");
        let uuid_group = uuidv4String.concat("_timestamp_" + Date.now().toString());
        setGroupUUID(uuid_group);
        setseaChatObj(await SEA.pair()); // SEA used to encrypt/decrypt messages (public-private keys)
    }
    async function handleCreateRoom(){
        console.log("---HERE------------HERE------------HERE");
        console.log(seaChatObj);
        let stringifySEARoomObj = JSON.stringify(seaChatObj);
        if (groupName === ''){
            alert("PLEASE ENTER A NAME FOR THE ROOM");
            return;
        }
        //variables for the 4 main properties in the ROoom
        let chatroomName = "CHATROOM_".concat(groupUUID);
        let folders = "foldersMetadata_".concat(groupUUID);
        let listEncryptedShare = "listEncryptedShare_".concat(groupUUID);
        let memberList = "memberList_".concat(groupUUID);

        // Insert relevant data in the groupUUID node
        await gunInstance.get(groupUUID).get("room_name").put(groupName);
        await gunInstance.get(groupUUID).get("uuid_date").put(groupUUID);
        await gunInstance.get(chatroomName); // use SEA to encrypt content/message
        await gunInstance.get(folders) //gun.get(filesCID)set(filesMetadata_).put{filenameProperty: fileName, CID_prop: CID, fileKey: encrypted exportedKey}

        // Encrypt the SEA.pair() used to encrypt/decrypt chat messages
        let encryptedSEAObj = await SEA.encrypt(seaChatObj, userInstance._.sea); // encrypt copy of room's SEA pair using my own SEA unique as the account.


        // Get your own username string and encrypted public key (epub) and intialize them into alias
        let alias, epub;
        await userInstance.get("alias").once(async (data)=> {
            alias = data;
                
            //Insert myself in the memberList node without needing to put the encrypted copy of the SEA.pair() of the room
            let myEpub = userInstance._.sea.epub; // Get my own encrypted public key (epub)
                    //Create unique public gun node
            let userPublicNodeRef = await gunInstance.get(alias).put({ "user_Alias": alias, "user_Epub": myEpub, "keyPairCopy": encryptedSEAObj, "AddedByFriend": alias, "friendEpub": myEpub  })
            await gunInstance.get(memberList).set(userPublicNodeRef);
            // Insert UUID-Date property name into your own user graph
            //This block is to insert data into your my_team_rooms to indicate which room you have access to.
            let roomName;
            await gunInstance.get(groupUUID).get("room_name").once(data=> roomName = data)
            await userInstance.get("my_team_rooms").set(groupUUID).put({nameOfRoom: roomName, uuidOfRoom: groupUUID, roomSEA: stringifySEARoomObj});
            roomUUIDObj.roomUUIDProperty = groupUUID;
            roomUUIDObj.roomName = roomName;
            
            navigate('room');
        });
        
    }

    return(

        <div className={toggleClassname}>
            <div className="create-room-container">
                <div className="create-room-box-exit">
                    <button onClick={handleClose} className="closeButton">X</button>
                </div>

                <div className="create-room-form">
                    <div className="flex-item0">
                        <h2>Create Room:</h2>
                        <label>Group Name: </label>
                        <input type="text" onChange={(e) => {
                            /* If textbox is empty, set groupName and groupUUID to '' */
                            if (e.target.value.length == 0) 
                                {setGroupName(''); setGroupUUID('')} 
                            else 
                                {setGroupName(e.target.value); generateUUID()}  } }/>
                        <div className="UUID-label-css">
                            <p>Group UUID:</p>
                            <b>{groupUUID}</b>
                        </div>                                
                    </div>
                    <div className="flex-item1">
                        <NavLink className="create-room-button" onClick={(e)=> { e.preventDefault(); handleCreateRoom() }} to="room">Create Team Room</NavLink>
                    </div>
                </div>
            </div>
        </div>
    );
}
