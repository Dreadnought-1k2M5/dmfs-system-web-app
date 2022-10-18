import React from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { Navigate } from "react-router-dom";

function CreateRoom({ roomUUIDObj, gunInstance, userInstance, handleClose, show, handleCloseAfterRoomCreated}){
    let [groupName, setGroupName] = useState('');
    let [groupUUID, setGroupUUID] = useState('');
    let [seaChatObj, setseaChatObj] = useState({});
    
    const toggleClassname = show ? "modal modal-container" : "modal display-none";

    function generateUUID(){
        let uuid_group = uuidv4().concat("-timestamp-" + Date.now().toString());
        setGroupUUID(uuid_group);
        setseaChatObj(SEA.pair()); // SEA used to encrypt/decrypt messages (public-private keys)
    }
    async function handleCreateRoom(){
        if (groupName === ''){
            alert("PLEASE ENTER A NAME FOR THE ROOM");
            return;
        }
        let chatroomName = "CHATROOM_".concat(groupUUID);
        let filesCID = "filesMetadata_".concat(groupUUID);
        let listEncryptedShare = "listEncryptedShare_".concat(groupUUID);
        let memberList = "memberList_".concat(groupUUID);

        await gunInstance.get(groupUUID).get("room_name").put(groupName);
        await gunInstance.get(groupUUID).get("uuid_date").put(groupUUID);

        await gunInstance.get(groupUUID).get(chatroomName); // use SEA to encrypt content/message
        await gunInstance.get(groupUUID).get(filesCID) //gun.get(setnode).set(filename).put{filenameProperty: fileName, CID_prop: CID, isEncrypted: (exportedKey ? true : false), jsonKey: exportedKey}
        await gunInstance.get(groupUUID).get(listEncryptedShare); //(gun.get.set.put || gun.get ) {forUser: “querty1”, share: enc}
        

        // Insert your account to the groupUUID->memberList Node
        let alias, epub, seaPriv;
        await userInstance.get("alias").once((data)=> alias = data);
        await userInstance.get("epub").once((data) => epub = data);
        await gunInstance.get(groupUUID).get(memberList).set({ "user-alias": alias, "user-epub": epub, "chatroom-sea": seaChatObj});

        // Insert UUID-Date property name into your own user graph
        let roomName;
        await gunInstance.get(groupUUID).get("room_name").once(data=> roomName = data)
        await userInstance.get("my_team_rooms").set(groupUUID).put({nameOfRoom: roomName, uuidOfRoom: groupUUID});
        roomUUIDObj.roomUUIDProperty = groupUUID;
        handleCloseAfterRoomCreated();
    }

    return(

        <div className={toggleClassname}>
            <div className="create-room-container">
                <div>
                    <button onClick={handleClose}>X</button>
                </div>
                <h2>Create Room: <span className="group-name-span"></span></h2>
                <div className="create-room-form">
                    <div className="flex-item0">
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

export default CreateRoom;