import React, { useEffect, useState, useReducer } from "react";
import { Web3Storage } from 'web3.storage';

import { SEA } from "gun";

import "./modal-css/upload-group-modal.css";

//REPLACE THIS LATER
const client = new Web3Storage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlQzY1QkMwZTU4NEFCNEFFQjdhZjMyNjdEMjI5MTZDOTQ1NUJBNkQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM0NTgzMzEwMTUsIm5hbWUiOiJjcDItbWluZXJ2YS1kbS1mc3MifQ.b4RKubGBnqq_x37Dm8xkocGvs05evwyS0x1U6_4CS5E'});


export default function UploadGroupModal({uuidRoomObj, gunInstance, userInstance, handleClose, show}){
    const toggleClassname = show ? "modal modal-upload-group-container" : "modal display-none";
    let [radioBoxSelected, setRadioBoxSelected] = useState();
    let [inputFolderState, setInputFolderState] = useState();
    
    let fileUploadGroup = React.createRef();

    async function generateKeyFunction(){
        return crypto.subtle.generateKey({ 'name': 'AES-CBC', 'length': 256 }, true, ['encrypt', 'decrypt']);
    }
    
    async function firstOption(){

        //Get the SEA.pair() of the team room you are in.
        let tempSEACopy;
        await userInstance.get("my_team_rooms").map().once(data => {
            delete data._;
            if(data.nameOfRoom === uuidRoomObj.roomName){
                tempSEACopy = data.roomSEA;
            }
        });

        let fileName, fileNameNoWhiteSpace, lastModdifiedVar, CID, fileFormat, exportedKey, myAlias;
        await userInstance.get('alias').on(v => myAlias = v);
        const fr = new FileReader();

        const getFileType = fileUploadGroup.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
        fileName = fileUploadGroup.current.files[0].name;
        fileNameNoWhiteSpace = fileUploadGroup.current.files[0].name.replaceAll(" ", "");
        lastModdifiedVar = fileUploadGroup.current.files[0].lastModified;
        lastModdifiedVar = new Date(lastModdifiedVar);
        lastModdifiedVar = lastModdifiedVar.toString(); // convert it to string because gun.js wouldn't accept it.
/*         console.log(fileUploadGroup.current.files[0]);
        console.log(lastModdifiedVar);
        console.log(typeof lastModdifiedVar); */

        fr.readAsArrayBuffer(fileUploadGroup.current.files[0]);

        fr.addEventListener('load', async (e)=>{
            let data = e.target.result; // e.target.result is similar to fr.result
            let iv = crypto.getRandomValues(new Uint8Array(16));
            const key = await generateKeyFunction();
            console.log(data);
            console.log(iv);
        
            crypto.subtle.encrypt({ 'name': 'AES-CBC', iv }, key, data)
            .then(async encrypted => {
                console.log(encrypted); // encrypted is an ArrayBuffer
                alert('The encrypted data is ' + encrypted.byteLength + ' bytes long'); // encrypted is an ArrayBuffer
                fileFormat = new File([encrypted], fileNameNoWhiteSpace, {type: getFileType, lastModified: lastModdifiedVar} ) // convert encrypted arraybuffer to blob.
                console.log("ENCRYPTED:");
                console.log(fileFormat);
                console.log("KEY USED TO ENCRYPT FILE");
                console.log(key);
                const fileInArray = [fileFormat];

                //Export CryptoKey in a JSON web key format
                exportedKey = await crypto.subtle.exportKey("jwk", key);
                let parsedExportedKey = JSON.stringify(exportedKey, null, " ");
                console.log(parsedExportedKey);

                //Encrypt parseExportedKey that can only be decrypted by members of the team room
                let encJSONKey = await SEA.encrypt(parsedExportedKey, tempSEACopy);
                console.log(encJSONKey);

                let parsedInitializationVector = window.btoa(String.fromCharCode.apply(null, iv));
                let encIV = await SEA.encrypt(parsedInitializationVector, tempSEACopy);
                console.log(encIV);

                alert("Folder: ".concat(inputFolderState));
                const res_CID = await client.put(fileInArray);
                let CID = res_CID;
                console.log(CID);
                //Version 
                await gunInstance.get("vc_".concat(fileName).concat(uuidRoomObj.roomUUIDProperty)).set({                    filenameProperty: fileName, 
                    filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                    CID_prop: CID, 
                    fileKey: encJSONKey, 
                    iv: encIV, 
                    fileType: getFileType,
                    date: lastModdifiedVar,
                    uploadedBy: myAlias
                })

                //Insert Folder

                //Individual UNIQUE node containing file metadata
                let fileRef = await gunInstance.get(fileName.concat(uuidRoomObj.roomUUIDProperty)).put({                    
                    filenameProperty: fileName, 
                    filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                    CID_prop: CID, 
                    fileKey: encJSONKey, 
                    iv: encIV, 
                    fileType: getFileType,
                    date: lastModdifiedVar,
                    uploadedBy: myAlias
                });

                //Inserting unique node into an actual "folder" node
                await gunInstance.get(inputFolderState.concat(uuidRoomObj.roomUUIDProperty)).set(fileRef);
                
                //Inserting the string name of the folder into groupUUID list of folder names
                await gunInstance.get("foldersMetadata_".concat(uuidRoomObj.roomUUIDProperty)).set(inputFolderState);

                alert("FILE ADDED");
                handleClose();
                //window.location.reload();

            }).catch(console.error);

        });

    }
    
    async function handleUploadGroup(event){
        event.preventDefault();


        console.log(typeof radioBoxSelected)
        switch(radioBoxSelected){
            case "0":
                alert("Selected first one");
                firstOption();
                break;
            case "1":
                break;
            default:
                alert("Select one of the options!");
                break;
        }
/*         
         */
    }
    return (
        <div className={toggleClassname}>
            <div className="upload-group-modal-box">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>
                <div className="upload-group-input-box">
                    <div>
                        <label>Upload a Document: </label>
                        <input type="file" accept=".doc,.DOC,.docx,.DOCX,.txt,TXT" className="upload-btn-class" ref={fileUploadGroup}></input>
                    </div>
                    <div className="radiobox-container">
                        <h3>Classify Document:</h3>
                        <div className="radiobox-item" >
                            <div>
                                <input type="radio" id="age1" name="age" value="0" onChange={(e) => setRadioBoxSelected(e.target.value)}/>
                            </div>
                            <label htmlFor="age1">Shared access to all members</label>
                        </div>
                        <div className="radiobox-item">
                            <div>
                                <input type="radio" id="age2" name="age" value="1" onChange={(e) => setRadioBoxSelected(e.target.value)}/>
                            </div>
                            <label htmlFor="age2">Enable Distributed User Permission</label>
                        </div>
                    </div>
                    <div className="location-node-box">
                        <input className="textbox-foldername" type="text" id="age2" name="age" onChange={(e) => setInputFolderState(e.target.value)} placeholder="Enter folder name" />
                    </div>
                    <div className="upload-btn-box">
                        <button type="submit" className="submit-btn-upload-group" onClick={(e) => handleUploadGroup(e)}  >Upload Document</button>
                    </div>
                </div>
            </div>
        </div>
    )
}