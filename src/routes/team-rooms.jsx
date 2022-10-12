import React, { useState } from "react";
import { useEffect } from "react";

import CreateRoom from "./modal-components/CreateRoom";

import './routes-css/team-rooms.css';

function TeamRoomComponent({userInstance}){
    let [isModalViewed, setIsModalViewed] = useState(false);
    function showModal(){
        setIsModalViewed(true);
    }
    function hideModal(){
        setIsModalViewed(false);
    }
    
    function event(){
        alert("CLICKED");
    }
    return (
        <div>
            <div className="top-toolbar">
                <button className="toolbar-btn-create-room" onClick={showModal}>Create New Team</button>
                <button className="toolbar-btn-create-room" >Join Team</button>
                <CreateRoom handleClose={hideModal} show={isModalViewed} />
            </div>
            <div className="rooms-flex-container">
                <div className="room-box" onClick={event}>
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
                <div className="room-box">
                    <h2>Title Room</h2>
                    <p>X Members</p>
                </div>
            </div>
        </div>
    );
}

export default TeamRoomComponent;