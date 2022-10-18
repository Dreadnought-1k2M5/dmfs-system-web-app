import React, { useState, useReducer } from "react";
import { useEffect } from "react";

import CreateRoom from "./modal-components/CreateRoom";

import ListRoomsComponent from "./team-rooms-sub-components/list-rooms";

import './routes-css/team-rooms.css';


/* function reducerHandler(currentState, newRoom){
    return { rooms: [...currentState.rooms, newRoom ] }
} */

function TeamRoomComponent({roomUUIDObj, gunInstance, userInstance}){
    let [isModalViewed, setIsModalViewed] = useState(false);

    //let [roomList, dispatch] = useReducer(reducerHandler, {rooms: []});

/*     useEffect(()=>{
        userInstance.get('my_team_rooms').map().once((key)=>{
            dispatch({roomName: key.nameOfRoom, roomUUID: key.uuidOfRoom});        })
    }, []); */
    function showModal(){
        setIsModalViewed(true);
    }
    function hideModal(){
        setIsModalViewed(false);
    }
    function hideModalAfterCreatedRoom(){
        setIsModalViewed(false);
    }
    
    return (
        <div>
            <div className="top-toolbar">
                <button className="toolbar-btn-create-room" onClick={showModal}>Create New Team</button>
                <button className="toolbar-btn-create-room" >Join Team</button>
                <CreateRoom roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideModal} handleCloseAfterRoomCreated={hideModalAfterCreatedRoom} show={isModalViewed} />
            </div>

            <ListRoomsComponent roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} />

        </div>
    );
}

export default TeamRoomComponent;