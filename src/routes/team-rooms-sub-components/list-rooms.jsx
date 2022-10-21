import React, { useState, useReducer } from "react";
import { useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";

import './list-rooms.css'

function reducerHandler(currentState, newRoom){
    return {  rooms: [newRoom, ...currentState.rooms]  }
}

const initialRoomListState = {
    rooms: []
}

function ListRoomsComponent({roomUUIDObj, gunInstance, userInstance}){
    let [roomList, dispatch] = useReducer(reducerHandler, initialRoomListState);    
    let navigate = useNavigate();

    useEffect(()=>{
        userInstance.get('my_team_rooms').map().on((key)=>{
            //console.log({roomName: key.nameOfRoom, roomUUID: key.uuidOfRoom});
            dispatch({roomName: key.nameOfRoom, roomUUID: key.uuidOfRoom});
        })
    }, []);

    function event(elem){ 
        console.log("POINT HEREEEEEEEEEEEE");
        roomUUIDObj.roomUUIDProperty = elem.roomUUID;
        roomUUIDObj.roomName = elem.roomName;
        navigate('room');
        
    }

    function filterDuplicatedRooms(){
        const filteredRoomList = roomList.rooms.filter((value, index)=>{
            const _value = JSON.stringify(value)
            return (
                index === roomList.rooms.findIndex(obj => {
                    return JSON.stringify(obj) === _value && JSON.stringify(obj)
                })
            )
        })
        return filteredRoomList;
    }
    
    return (
        <div>
            <div className="rooms-flex-container">
                { filterDuplicatedRooms().map((elem, index) =>
                    <div className="room-box" key={index}>
                        <div className="navlink-css" onClick={(e) => {e.preventDefault(); event(elem)} }>
                            <h2>{elem.roomName}</h2>
                        </div>
                        <div>
                            <p>UUID-Date: <b>{elem.roomUUID}</b></p>
                        </div>  
                    </div>       
            )}
            </div>
        </div>
    );
}

export default ListRoomsComponent;