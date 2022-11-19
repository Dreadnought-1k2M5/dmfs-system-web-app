import React, { useState, useReducer } from "react";
import { useEffect } from "react";

import CreateRoom from "./modal-components/CreateRoom";

import ListRoomsComponent from "./team-rooms-sub-components/list-rooms";
import JoinRoomModal from "./modal-components/JoinRoomModal";

import './routes-css/team-rooms.css';

import createIcon from '../add-icon.png'
import joinIcon from '../join-icon.png'


/* function reducerHandler(currentState, newRoom){
    return { rooms: [...currentState.rooms, newRoom ] }
} */

function TeamRoomComponent({roomUUIDObj, gunInstance, userInstance}){
    let [isModalCreateRoomViewed, setIsCreateRoomModalViewed] = useState(false);
    let [isModalJoinRoomViewed, setIsModalJoinRoomViewed] = useState(false);

    //let [roomList, dispatch] = useReducer(reducerHandler, {rooms: []});

/*     useEffect(()=>{
        userInstance.get('my_team_rooms').map().once((key)=>{
            dispatch({roomName: key.nameOfRoom, roomUUID: key.uuidOfRoom});        })
    }, []); */
    function showCreateRoomModal(){
        setIsCreateRoomModalViewed(true);
    }
    function hideCreateRoomModal(){
        setIsCreateRoomModalViewed(false);
    }
    

    function showJoinRoomModal(){
        setIsModalJoinRoomViewed(true);
    }
    function hideJoinRoomModal(){
        setIsModalJoinRoomViewed(false);
    }

    return (
        <div>
            <div className="top-toolbar">

                <div className="create-join-container">
                    <div className="create-new-team-container">
                        <img src={createIcon} alt="" className="TbIcon"/>
                        <button className="toolbar-btn-create-room" onClick={showCreateRoomModal}>Create New Team</button>
                    </div>
                    <div className="join-team-container">
                        <img src={joinIcon} alt="" className="TbIcon"/>
                        <button className="toolbar-btn-create-room" onClick={showJoinRoomModal}>Join Room</button>
                    </div>
                    
                </div>

                
                                     

                <CreateRoom roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideCreateRoomModal} show={isModalCreateRoomViewed} />
                <JoinRoomModal roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideJoinRoomModal} show={isModalJoinRoomViewed} />
            </div>

            <ListRoomsComponent roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} />

        </div>
    );
}

export default TeamRoomComponent;