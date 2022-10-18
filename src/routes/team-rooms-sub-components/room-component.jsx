import React, { useState } from "react";

import "./room-component.css";
import AddMemberModal from "../modal-components/AddMemberRoom";

function RoomComponent({gunInstance, userInstance, roomUUIDObj}){
    let [isAddUserModalViewed, setIsAddUserModalViewed] = useState(false);

    let roomName;
    gunInstance.get(roomUUIDObj.roomUUIDProperty).get("room_name").once(data => roomName = data);

    function showModal(){
        setIsAddUserModalViewed(true);
    }
    function hideModal(){
        setIsAddUserModalViewed(false);
    }
    function hideModalAfterCreatedRoom(){
        setIsAddUserModalViewed(false);
    }
    return (
        <div>
            <div className="top-toolbar-room">
                <button className="toolbar-btn-create-room" >Add a user</button>
            </div>
            <div className="room-top-container">
                <h1>{roomName}</h1>
                
                <div className="grid-room">

                </div>
            </div>
        </div>
    )
}

export default RoomComponent;