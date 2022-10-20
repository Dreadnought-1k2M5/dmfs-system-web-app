import React, { useEffect } from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { Navigate } from "react-router-dom";

import "./modal-css/add-member-room.css";

function AddMemberModal({uuidRoom, gunInstance, userInstance, handleClose, show, handleCloseAfterMemberAdded}){
    const toggleClassname = show ? "modal modal-add-member-container" : "modal display-none";

    let [userAlias, setUserAlias] = useState('');
    let [epubUser, setEpubUser] = useState('');
    
    useEffect(()=>{
        
    }, [])

    async function handleCheckUser(){

        let ownAlias;
        userInstance.get("alias").once(data => ownAlias = data);
        console.log(ownAlias);
        if(userAlias === ownAlias){
            alert("You can't add your own username!\nTry a different user");
            return;
        }

        let publicUserNode = await gunInstance.get("~@".concat(userAlias));
        console.log(publicUserNode);
        if(publicUserNode === undefined){
            alert("USER DOESN'T EXIST\nTRY AGAIN");
            return;
        }


        delete publicUserNode._;

        //public key of the user being added.
        let getUserPublicKey = Object.keys(publicUserNode)[0].substring(1); //remove '~' and extract public key
        console.log(getUserPublicKey);

        //Query user graph of a user that contains encrypted public key
        let user = await gunInstance.user(getUserPublicKey);
        console.log(user);
        console.log(user.epub);


        const generateKey = SEA.secret(user.epub, userInstance._.sea);
        let tempRoomSEAPair;
        //Get the encrypted copy of the SEA.pair of the room in your own user graph
        userInstance.get("my_team_rooms").get(uuidRoom).once(async data =>{
            tempRoomSEAPair = data.roomSEA;            
        })
                    
        //decrypt the encrypted copy of SEA.pair of the room.
        let decryptedSEAPair = await SEA.decrypt(tempRoomSEAPair, userInstance._.sea);


    }
    
    return (
        <div className={toggleClassname}>
            <div className="add-member-modal-box">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>
                <div className="add-member-modal-form">
                    <h2>Add a user to the group</h2>
                    <div className="add-user-form">
                        <div className="label-input-box">
                            <label>User Alias (username): </label>
                            <input type="text" onChange={(e)=> setUserAlias(e.target.value)} />
                        </div>
                        <div className="label-input-box">
                            <p>{userAlias}</p>
                        </div>
                    </div>
                    <div>
                        <button onClick={handleCheckUser}>Add User</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default AddMemberModal;