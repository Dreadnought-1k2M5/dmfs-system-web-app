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
            <AddMemberModal gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} show={isAddUserModalViewed} handleCloseAfterMemberAdded={hideModalAfterCreatedRoom}></AddMemberModal>
            <div className="top-toolbar-room">
                <button className="toolbar-btn-create-room" onClick={(e)=> {e.preventDefault(); showModal();}}>Add a user</button>
                <button className="toolbar-btn-create-room" >Upload a document</button>
            </div>
            <div className="room-top-container">
                <h1>{roomName}</h1>
                <div className="grid-room">
                    <div className="documents-list-container">

                    </div>
                    <div className="chatroom-container">

                    </div>
                    <div className="member-list-container">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoomComponent;