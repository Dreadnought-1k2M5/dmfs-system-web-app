import React, { useEffect } from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { Navigate } from "react-router-dom";

import {CopyToClipboard} from 'react-copy-to-clipboard';

import "./modal-css/add-member-room.css";

function AddMemberModal({uuidRoomObj, gunInstance, userInstance, handleClose, show}){
    const toggleClassname = show ? "modal modal-add-member-container" : "modal display-none";

    let [userAlias, setUserAlias] = useState('');
    let [epubUser, setEpubUser] = useState('');
    let [roomContext, setRoomContext] = useState('');
    
    useEffect(()=>{
        gunInstance.get(uuidRoomObj.roomUUIDProperty).get("room_name").once(data =>{
            setRoomContext(data);
        });

    }, []);

    async function handleCheckUser(){

        let ownAlias;
        let myEpub = await userInstance._.sea.epub;

        await userInstance.get("alias").once(data => ownAlias = data);

        if(userAlias === ownAlias){
            alert("You can't add your own username!\nTry a different user");
            return;
        }

        //Get public user object of the new member (non-encrypted pubkey)
        let publicUserNode = await gunInstance.get("~@".concat(userAlias));

        if(publicUserNode === undefined){
            alert("USER DOESN'T EXIST\nTRY AGAIN");
            return;
        }

        delete publicUserNode._; // Delete '_' to access the non-encrypted public key

        //public key of the user being added.
        let getUserPublicKey = Object.keys(publicUserNode)[0].substring(1); //remove '~' and extract public key

        //Query user graph of a new member that contains encrypted public key
        let user = await gunInstance.user(getUserPublicKey);
        console.log(user);
        // Get new member's epub
        let epubKey = user.epub;


        await userInstance.get("my_team_rooms").map(async data => {
            delete data._;

            //Check if the current iteration's nameOfRoom property matches the room you are in
            if (data.nameOfRoom === uuidRoomObj.roomName){
                console.log(data.roomSEA);

                console.log(user.epub);
                console.log(userInstance._.sea);

                //Generate new key for the new member
                const generateKey = await SEA.secret(user.epub, userInstance._.sea);
                console.log(generateKey);
                const encryptedSEAKey = await SEA.encrypt(JSON.parse(data.roomSEA), generateKey);//data.roomSEA is always string so parse and convert it.
                console.log(typeof myEpub);
                console.log(encryptedSEAKey);
                console.log(typeof encryptedSEAKey);
                
                
                //Create unique public node for user data
                let userPublicNodeRef = await gunInstance.get(userAlias).put({ "user_Alias": userAlias, "user_Epub": epubKey, "keyPairCopy": encryptedSEAKey, "AddedByFriend": ownAlias, "friendEpub": myEpub })

                //Insert into the public memberList.
                gunInstance.get("memberList_".concat(uuidRoomObj.roomUUIDProperty)).set(userPublicNodeRef);
                
                handleClose();
            }

        });


    }
    
    return (
        <div className={toggleClassname}>
            <div className="add-member-modal-box">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>
                <h2>Add a user to the group</h2>
                <div className="add-member-modal-form">
                    <div className="add-user-form">
                        <div className="label-input-box">
                            <label>User Alias (username): </label>
                            <input type="text" onChange={(e)=> setUserAlias(e.target.value)} />
                        </div>
                        <div className="clipboard-box">
                            <CopyToClipboard className="clipboard-css" text={uuidRoomObj.roomUUIDProperty} onCopy={() => this.setState({copied: true})}>
                                <button>Copy Room's Unique Identifier:</button>
                            </CopyToClipboard>
                            <div className="label-uuid-css">
                                <label>{uuidRoomObj.roomUUIDProperty}</label>
                            </div>

                        </div>
                    </div>
                    <div className="add-user-btn-box">
                        <button className="add-btn" onClick={handleCheckUser}>Add User</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddMemberModal;