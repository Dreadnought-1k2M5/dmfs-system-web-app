import React, { useState } from "react";
import { useEffect } from "react";

import './routes-css/team-rooms.css';

function TeamRoomComponent({userInstance}){
    function event(){
        alert("CLICKED");
    }
    return (
        <div>
            <div className="top-toolbar">
                <button className="toolbar-btn-create-room">Create New Team</button>
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