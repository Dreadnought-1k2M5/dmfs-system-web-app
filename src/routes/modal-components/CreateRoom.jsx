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
    function handleCreateRoom(){
/*         alert(groupName + "\n" + "UUID-Date: " + groupUUID);
        gunInstance.get(groupUUID).get("roomName").put({}) */
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