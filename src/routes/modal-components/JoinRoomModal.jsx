import React from "react";
import { useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { useNavigate } from "react-router-dom";

import './modal-css/join-room.css';

export default function JoinRoomModal({ roomUUIDObj, gunInstance, userInstance, handleClose, show}){
    let [roomUUIDState, setRoomUUIDState] = useState('');
    let navigate = useNavigate();

    const toggleClassname = show ? "modal-join-room modal-join-room-container" : "modal-join-room display-none";


    async function handleJoinRoom(){
        console.log("Join room handler");
        console.log(roomUUIDState);
        let myAlias, myEpub = userInstance._.sea.epub, roomName;
        await gunInstance.get(roomUUIDState).get("room_name").on(async name =>{
            roomName = name;
            console.log(name);
            await userInstance.get("alias").once(async myAlias => {
                let secretKey, decryptedSEAPair, friendEpub, keyPairCopy;
                await gunInstance.get("memberList_".concat(roomUUIDState)).map().on( async (data) =>{
                    if(myAlias == data.user_Alias && data.user_Epub == myEpub){
            
                        friendEpub = data.friendEpub;
                        keyPairCopy = data.keyPairCopy;
                        console.log(friendEpub);
                        console.log(typeof friendEpub);
        
                        console.log(keyPairCopy);
                        console.log(typeof keyPairCopy);
        
        
                        // Still need to catch any possible error on this part
                        secretKey = await SEA.secret(friendEpub, userInstance._.sea);
                        console.log(secretKey);
                        
                        // Still need to catch any possible error on this part
                        decryptedSEAPair = await SEA.decrypt(keyPairCopy, secretKey); // decrypteddSEAPair should be an object SEA.pair of the team room
                        console.log(decryptedSEAPair);
                        console.log(typeof decryptedSEAPair);
                        console.log(JSON.stringify(decryptedSEAPair));
                        let stringifySEARoomObj = JSON.stringify(decryptedSEAPair)
                        
        
                        await userInstance.get("my_team_rooms").set(roomUUIDState).put({nameOfRoom: roomName, uuidOfRoom: roomUUIDState, roomSEA: JSON.stringify(decryptedSEAPair)});
        
                        roomUUIDObj.roomUUIDProperty = roomUUIDState;
                        roomUUIDObj.roomName = roomName;
        
                        navigate("room");
                        
                    }
                    
                })
        
            });
        })
       
        

    }

    return (
        <div className={toggleClassname}>
            <div className="join-room-container">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>

                <div className="join-room-form">
                    <div className="flex-item0">
                        <h2>Join Room:</h2>
                        <p className="flex-tiem0-description">Enter the Room's UUID-Date to check if you are added by a member</p>
                        <label>Group UUID: </label>
                        <input type="text" onChange={(e) => {
                            /* If textbox is empty, set groupName and groupUUID to '' */
                            if (e.target.value.length == 0) 
                                {setRoomUUIDState('');} 
                            else 
                                {setRoomUUIDState(e.target.value);}  } }/>                            
                    </div>
                    <div className="flex-item1">
                        <NavLink className="join-room-button" onClick={(e)=> { e.preventDefault(); handleJoinRoom() }} to="room">Join Team Room</NavLink>
                    </div>
                </div>
            </div>
        </div>
    )
}
