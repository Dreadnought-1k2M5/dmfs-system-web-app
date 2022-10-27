import React, { useEffect, useState, useReducer } from "react";
import { Web3Storage } from 'web3.storage';

import { SEA } from "gun";

import "./modal-css/upload-group-modal.css";

//REPLACE THIS LATER
const client = new Web3Storage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlQzY1QkMwZTU4NEFCNEFFQjdhZjMyNjdEMjI5MTZDOTQ1NUJBNkQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM0NTgzMzEwMTUsIm5hbWUiOiJjcDItbWluZXJ2YS1kbS1mc3MifQ.b4RKubGBnqq_x37Dm8xkocGvs05evwyS0x1U6_4CS5E'});

//Members
const currentMemberListState = {
    membersArray: []
}
const memberListReducerHandler = (currentMemberListState, member) =>{
    return {
        membersArray: [member, ...currentMemberListState.membersArray]
    }
}

export default function UploadGroupModal({uuidRoomObj, gunInstance, userInstance, handleClose, show}){
    const toggleClassname = show ? "modal modal-upload-group-container" : "modal display-none";
    let [radioBoxSelected, setRadioBoxSelected] = useState(-1);
    let [inputFolderState, setInputFolderState] = useState('');
    let [isSecretShareEnabled, setSecretShareOption] = useState(false);
    let [myAlias, setMyAlias] = useState('');
    //Member List useReducer
    const [stateMemberList, memberListDispatch] = useReducer(memberListReducerHandler, currentMemberListState);


    //state holding share holders
    let [shareHolder1, setShareHolder1] = useState('');
    let [shareHolder2, setShareHolder2] = useState('');
    
    
    let fileUploadGroup = React.createRef();

    useEffect(()=>{
        userInstance.get("alias").on(data => setMyAlias(data));
        gunInstance.get("memberList_".concat(uuidRoomObj.roomUUIDProperty)).map().on(data => {
            console.log(data);
            memberListDispatch({memberAlias: data.user_Alias, memberEpub: data.user_Epub});
        })
    }, [])
    const filteredMemberList = () =>{
        console.log("filtered members function called")
        const formattedMemberList = stateMemberList.membersArray.filter((value, index) => {

            const _value = JSON.stringify(value);
            return (
                index ===
                stateMemberList.membersArray.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return formattedMemberList;
    }

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
                await gunInstance.get("vc_".concat(fileName).concat(uuidRoomObj.roomUUIDProperty)).set({                    
                    filenameProperty: fileName, 
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
                    uploadedBy: myAlias,
                    accessType: "shared"
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
    
    async function secondOption(holder1, holder2, holder3){
        
        //generate SEA.pair() to encrypt/decrypt parsedExportedKey and parsedIV
        const fileSEA = await SEA.pair();

        alert("secret share");
         let fileName, fileNameNoWhiteSpace, lastModdifiedVar, CID, fileFormat, exportedKey, myAlias;
         await userInstance.get('alias').on(v => myAlias = v);
         const fr = new FileReader();
 
         const getFileType = fileUploadGroup.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
         fileName = fileUploadGroup.current.files[0].name;
         fileNameNoWhiteSpace = fileUploadGroup.current.files[0].name.replaceAll(" ", "");
         lastModdifiedVar = fileUploadGroup.current.files[0].lastModified;
         lastModdifiedVar = new Date(lastModdifiedVar);
         lastModdifiedVar = lastModdifiedVar.toString(); // convert it to string because gun.js wouldn't accept it.

 
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
                 let encJSONKey = await SEA.encrypt(parsedExportedKey, fileSEA);
                 console.log(encJSONKey);
 
                 let parsedInitializationVector = window.btoa(String.fromCharCode.apply(null, iv));
                 let encIV = await SEA.encrypt(parsedInitializationVector, fileSEA);
                 console.log(encIV);
 
                 alert("Folder: ".concat(inputFolderState));
                 
                 const res_CID = await client.put(fileInArray);
                 let CID = res_CID;

                                 
                 let seaJSON = JSON.stringify(fileSEA);
                 let indexTotal = (seaJSON.length - 1) / 3;
                 let share1 = seaJSON.substring(0, indexTotal);
                 console.log(share1);
                 let share2 = seaJSON.substring(indexTotal, indexTotal * 2);
                 console.log(share2);
                 let share3 = seaJSON.substring(indexTotal * 2, indexTotal * 3 + 1);
                 console.log(share3);

                 //For holder1
                 let secret1 = await SEA.secret(holder1.memberEpub, userInstance._.sea);
                 let encShare1 = await SEA.encrypt(share1, secret1);
                 let shareNodeRef1 = await gunInstance.get(fileName.concat(holder1.memberAlias).concat(uuidRoomObj.roomUUIDProperty)).put({
                    intendedUser: holder1.memberAlias,
                    providedBy: myAlias,
                    providerEpub: userInstance._.sea.epub,
                    share: encShare1,
                    filename: fileName,
                    roomUUID: uuidRoomObj.roomUUIDProperty
                 })

                 
                 //Public node where encrypted shares are stored to be retreived by authorized users
                 await gunInstance.get("publicShareQueue".concat(uuidRoomObj.roomUUIDProperty)).set(shareNodeRef1);

                 //For holder2
                 let secret2 = await SEA.secret(holder2.memberEpub, userInstance._.sea);
                 let encShare2 = await SEA.encrypt(share2, secret2);
                 let shareNodeRef2 = await gunInstance.get(fileName.concat(holder2.memberAlias).concat(uuidRoomObj.roomUUIDProperty)).put({
                    intendedUser: holder2.memberAlias,
                    providedBy: myAlias,
                    providerEpub: userInstance._.sea.epub,
                    share: encShare2,
                    filename: fileName,
                    roomUUID: uuidRoomObj.roomUUIDProperty
                 })

                 await gunInstance.get("publicShareQueue".concat(uuidRoomObj.roomUUIDProperty)).set(shareNodeRef2);


                 //No need to encypt the share for 
                 let shareNodeRef3 = await userInstance.get(fileName.concat(myAlias)).put({
                    fileName: fileName,
                    encShareFile: share3,
                    roomUUID: uuidRoomObj.roomUUIDProperty
                 });
                 
                 await userInstance.get("documentsWithShares".concat(uuidRoomObj.roomUUIDProperty)).set(shareNodeRef3);

                 //dcoument node that contains a list of share holder's alias, to indicate which user holds a share for the file
                 let shareHoldersList = gunInstance.get(fileName.concat("_shareSet_").concat(uuidRoomObj.roomUUIDProperty)).set({
                    holder1: holder1.memberAlias, holder2: holder2.memberAlias, holder3: myAlias
                 })
 



                 //Version 
                 await gunInstance.get("vc_".concat(fileName).concat(uuidRoomObj.roomUUIDProperty)).set({
                     filenameProperty: fileName, 
                     filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                     CID_prop: CID, 
                     fileKey: encJSONKey, 
                     iv: encIV, 
                     fileType: getFileType,
                     date: lastModdifiedVar,
                     uploadedBy: myAlias,
                     accessType: "secretShare",
                     shareHoldersList: shareHoldersList
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
                     uploadedBy: myAlias,
                     accessType: "secretShare",
                     shareHoldersList: shareHoldersList
                 });
 
                 //Inserting unique node into a unique "folder" node
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
                alert("Selected second one");
                //check if there at least 3 members in the room
                if(filteredMemberList().length < 3){
                    alert("NOT ENOUGH MEMBERS");
                    return;
                }
                let temp1 = null, temp2 = null;

                filteredMemberList().map((elem)=>{
                    console.log(elem);
                    if(elem.memberAlias == shareHolder1){
                        temp1 = elem;
                    } else if(elem.memberAlias === shareHolder2){
                        temp2 = elem;
                    }
                 })
                 if (temp1 === null){
                    alert(`${shareHolder1} doesn't exist! Try again.`);
                    return;
                } else if (temp2 === null){
                    alert(`${shareHolder2} doesn't exist! Try again.`);
                    return;
                }
                secondOption(temp1, temp2, myAlias);
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
                                <input type="radio" id="option1" name="age" value="0" onChange={(e) => { setRadioBoxSelected(e.target.value); setSecretShareOption(false);}}/>
                            </div>
                            <div>
                                <label htmlFor="option1"><b>Shared access to all members</b></label>
                                <p className="ss-ooption-description-css">(This option enables all members to decrypt this document)</p>
                            </div>
                        </div>
                        <div className="radiobox-item-secret-share">
                            <div className="radiobox-item">
                                <div>
                                    <input type="radio" id="option2" name="age" value="1" onChange={(e) => { setRadioBoxSelected(e.target.value); setSecretShareOption(true); }}/>
                                </div>
                                <div>
                                    <label htmlFor="option2"><b>Enable Secret Share Protection</b></label>
                                    <p className="ss-ooption-description-css">(This option requires atleast 3 members in the team room)</p>
                                </div>
                            </div>

                            {isSecretShareEnabled && 
                                <div className="secret-share-holder-form">
                                    <div>
                                        <label>Share holder 1:</label>
                                        <input type="text" onChange={(e) => setShareHolder1(e.target.value)}></input>
                                    </div>
                                    <div>
                                        <label>Share holder 2:</label>
                                        <input type="text" onChange={(e) => setShareHolder2(e.target.value)}></input>
                                    </div>
                                </div>}

                        </div>
                        <div className="radiobox-item">
                            <div>
                                <input type="radio" id="option3" name="age" value="2" onChange={(e) => setRadioBoxSelected(e.target.value)}/>
                            </div>
                            <div>
                                <label htmlFor="option3"><b>Custom Permission</b></label>
                                <p className="ss-ooption-description-css">(Specify which user can decrypt the file later on)</p>
                            </div>
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