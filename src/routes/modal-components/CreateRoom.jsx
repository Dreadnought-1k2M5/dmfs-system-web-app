import React from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';

function CreateRoom({gunInstance, handleClose, show}){
    let [groupName, setGroupName] = useState('');
    let [groupUUID, setGroupUUID] = useState('');
    
    const toggleClassname = show ? "modal modal-container" : "modal display-none";

    function generateUUID(){
        let uuid_group = uuidv4().concat("-timestamp-" + Date.now().toString());
        setGroupUUID(uuid_group);
    }
    async function handleCreateRoom(){
        let chatroomName = "CHATROOM-".concat(groupUUID);
        let member = "members-".concat(groupUUID);
        let filesCID = "files-metadata-".concat(groupUUID);
        let listEncryptedShare = "list-encrypted-share".concat(groupUUID);

        await gunInstance.get(groupUUID).get("room-name").put(groupName);
        await gunInstance.get(groupUUID).get("uuid-date").put(groupUUID);

        await gunInstance.get(groupUUID).get(chatroomName); // use SEA to encrypt content/message
        await gunInstance.get(groupUUID).get(filesCID) //gun.get(setnode).set(filename).put{filenameProperty: fileName, CID_prop: CID, isEncrypted: (exportedKey ? true : false), jsonKey: exportedKey}
        await gunInstance.get(groupUUID).get(listEncryptedShare); //(gun.get.set.put || gun.get ) {forUser: “querty1”, share: enc}
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
                        <p className="UUID-label-css">Group UUID-Date: <b>{groupUUID}</b></p>
                    </div>
                    <div className="flex-item1">
                        <input type="button" className="create-room-button" value="Create Team Room" onClick={handleCreateRoom}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateRoom;