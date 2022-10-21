import React, { useEffect } from "react";
import { useState } from "react";


import './modal-css/create-room.css';

import { v4 as uuidv4 } from 'uuid';
import { SEA } from "gun";
import { NavLink } from "react-router-dom";

import { Navigate } from "react-router-dom";

import "./modal-css/add-member-room.css";

function AddMemberModal({uuidRoomObj, gunInstance, userInstance, handleClose, show, handleCloseAfterMemberAdded}){
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
        
        // Get new member's epub
        let epubKey = user.epub;

        //Get the encrypted copy of the SEA.pair of the room in your own user graph
        let decryptedSEAPair;

        await userInstance.get("my_team_rooms").map(async data => {
            delete data._;


            //Check if the current iteration's nameOfRoom property matches the room you are in
            if (data.nameOfRoom === uuidRoomObj.roomName){

                console.group(data.roomSEA);
                decryptedSEAPair = await SEA.decrypt(data.roomSEA, userInstance._.sea);

            }

        });

        //Generate new key for the new member
        const generateKey = await SEA.secret(user.epub, userInstance._.sea);
        console.log(generateKey);
        const encryptedSEAKey = await SEA.encrypt(decryptedSEAPair, generateKey);
        console.log(typeof myEpub);
        console.log(encryptedSEAKey);

        //Insert into the public memberList.
        await gunInstance.get("memberList_".concat(uuidRoomObj.roomUUIDProperty)).set({ "user_Alias": userAlias, "user_Epub": epubKey, "keyPairCopy": encryptedSEAKey, "AddedByFriend": ownAlias, "friendEpub": myEpub })
        
        console.log("MEMBER LIST");
        await gunInstance.get("memberList_".concat(uuidRoomObj.roomUUIDProperty)).map().on(data => {
            console.log(data);
        })
        //Insert into 
/*         
 */
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