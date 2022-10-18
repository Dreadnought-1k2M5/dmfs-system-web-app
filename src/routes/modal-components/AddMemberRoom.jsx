import React, { useEffect } from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { Navigate } from "react-router-dom";

import "./modal-css/add-member-room.css";

function AddMemberModal({gunInstance, userInstance, handleClose, show, handleCloseAfterMemberAdded}){
    const toggleClassname = show ? "modal modal-add-member-container" : "modal display-none";

    let [userAlias, setUserAlias] = useState('');
    let [epubUser, setEpubUser] = useState('');

    useEffect(()=>{
        
    }, [])

    async function handleCheckUser(){
        console.log(userAlias);
        let publicUserNode;
        await gunInstance.get("~@".concat(userAlias)).on(data => {
            publicUserNode = data;
        });
        delete publicUserNode._;

        let getUserPublicKey = Object.keys(publicUserNode)[0].substring(1); //remove '~' and extract public key
        console.log(getUserPublicKey);

        //Query user graph of a user that contains encrypted public key
        let user = await gunInstance.user(getUserPublicKey);
        console.log(user.epub);

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