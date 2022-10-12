import React from "react";
import { useState } from "react";

import './modal-css/create-room.css';

function CreateRoom({handleClose, show}){
    let [isModalViewed, setIsModalViewed] = useState(false);
    
    const toggleClassname = show ? "modal modal-container" : "modal display-none";
    return(
        <div className={toggleClassname}>
            <div className="create-room-container">
                <div>
                    <button onClick={handleClose}>X</button>
                </div>
                <h2>Create Room</h2>
                <form className="create-room-form">
                    <div className="flex-item0">
                        <label>Group Name: </label>
                        <input type="text" />
                    </div>
                    <div className="flex-item1">
                        <input type="submit" />
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CreateRoom;