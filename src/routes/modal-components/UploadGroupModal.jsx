import React, { useEffect, useState, useReducer } from "react";
import { Web3Storage } from 'web3.storage';

import { SEA } from "gun";

import "./modal-css/upload-group-modal.css";

import Axios from "axios";

import folderIcon from "../../icons/folder.png"
import folderIconSelected from "../../icons/folder-selected.png"


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

//Folders
let currentStateFolderList = {
    folderListArray: []
  }
  
  const folderListReducerHandler = (currentStateFolderList, folder)=>{
    return {
      folderListArray: [folder, ...currentStateFolderList.folderListArray]
    }
  
  }


function SubfolderRender({element, handleSelectedFolderItem}){

/*     async function handleSelectedFolderItem(index, folder){
        setFolderItemChosen(folder.folderNameNodeFull);
        if(isSubFolderSelectedState.isSelected){
            setIsSubFolderSelectedState({isSelected: false, indexProp: null}); 
            setIsSubFolderSelectedState({isSelected: true, indexProp: index}); 
        }

        else{
            setIsSubFolderSelectedState({isSelected: true, indexProp: index}); 
        }
    } */

    return (
        <ul>
            {element.map((data, index)=>
                <li key={index}>
                    {console.log(data.itemsProp.length)}
                    <div className={/* (isSubFolderSelectedState.isSelected && isSubFolderSelectedState.indexProp === index++) ? "folder-item-css-active" :  */"folder-item-css"}  onClick={(e) => { alert(data.folderNameProp); handleSelectedFolderItem(e, data);} }>
                        {console.log(data)}
                        <img src={/* (isSubFolderSelectedState.isSelected && isSubFolderSelectedState.indexProp === index++) ? folderIconSelected :  */folderIcon} height="33px" width="33px"></img>
                        <p>{data.folderNameClean}</p>
                    </div>
                    {data.itemsProp.length > 0 && <SubfolderRender element={data.itemsProp} handleSelectedFolderItem={handleSelectedFolderItem}/>}

                </li>
            )}
        </ul>


    )
}

export default function UploadGroupModal({uuidRoomObj, gunInstance, userInstance, handleClose, show}){
    const toggleClassname = show ? "modal-upload-file-group modal-upload-group-container" : "modal-upload-file-group display-none";
    let [radioBoxSelected, setRadioBoxSelected] = useState(-1);

    //useReducer for folders
    let [folderListState, dispatchFolderList] = useReducer(folderListReducerHandler, currentStateFolderList);
    let [folderListToRender, setFolderListToRender] = useState([]);

    //Track which folder is selected
    //let [isFolderSelectedState, setIsFolderSelectedState] = useState({isSelected: false, indexProp: null})

    //Track which folder is selected either to be the parent folder of the new FOLDER or the folder where the new document metadata will be stored
    let [folderItemChosen, setFolderItemChosen] = useState(null);
    

    let [inputParentFolderState, setInputParentFolderState] = useState(null);
    let [inputFolderState, setInputFolderState] = useState(null);
    
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
            memberListDispatch({memberAlias: data.user_Alias, memberEpub: data.user_Epub});
        })

        gunInstance.get("foldersMetadata_".concat(uuidRoomObj.roomUUIDProperty)).map().once(async (data, key) =>{
            let objectItem = {
                folderNameNodeFull: null,
                folderNameClean: null,
                itemsProp: []
            }
            dispatchFolderList(await traverseSubfolder(data, key, objectItem));
        })

    }, [])

    // Remove duplicated folder names from the "folders" property in the currentFolderState.
    const filteredFolderListHandler = () =>{
        const filteredFolderList = folderListState.folderListArray.filter((value, index) => {
            const _value = JSON.stringify(value);

            return (
                index ===
                folderListState.folderListArray.findIndex(obj => {

                    return JSON.stringify(obj) === _value 
                })
            )
        })
    
        return filteredFolderList;
    
    }

    async function traverseSubfolder(data, key, objectItem){
        /*   console.log("-----------------------Traversed-----------------------");
          console.log(key) */
          objectItem.folderNameNodeFull = key;
          let substr1 = key.substring(0, key.indexOf("_sep_"));
          objectItem.folderNameClean = substr1.replaceAll('_', ' ');
        
          for (const key1 in data) {
            if(key1.includes("_subfolder_")){
              let itemPropObject = {
                folderNameProp: key1,
                itemsProp: []
              }
        
        /*       console.log(key1) */
              await gunInstance.get(key1).once(async (data, key) =>{
                objectItem.itemsProp.push(await traverseSubfolder(data, key, itemPropObject));
              })
        
            }
          }
        return objectItem;
    }


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
        console.log("FIRST OPTION");
        alert("FIRST OPTION");
        let tempSEACopy;
        await userInstance.get("my_team_rooms").map().once(async data => {
            console.log(data);
            delete data._;
            if(data.nameOfRoom === uuidRoomObj.roomName){
                tempSEACopy = data.roomSEA;

            }
        });

        

        let fileName, fileNameNoWhiteSpace, lastModdifiedVar, CID, fileFormat, exportedKey, myAlias;
        await userInstance.get('alias').once(v => myAlias = v);
        const fr = new FileReader();

        const getFileType = fileUploadGroup.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
        fileName = fileUploadGroup.current.files[0].name;
        fileNameNoWhiteSpace = fileUploadGroup.current.files[0].name.replaceAll(" ", "");
        lastModdifiedVar = fileUploadGroup.current.files[0].lastModifiedDate;
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
                
                //tempSEACopy is is JSON format, hence parse it.
                let parsedSEARoom = JSON.parse(tempSEACopy);
                //Encrypt parseExportedKey that can only be decrypted by members of the team room
                let encJSONKey = await SEA.encrypt(parsedExportedKey, parsedSEARoom);
                console.log(encJSONKey);

                let parsedInitializationVector = window.btoa(String.fromCharCode.apply(null, iv));
                let encIV = await SEA.encrypt(parsedInitializationVector, parsedSEARoom);
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
                if(folderItemChosen === null){
                    alert("No Folder selected");
                    let finalInputFolderState = inputFolderState.replaceAll(' ','_');
                    await gunInstance.get(finalInputFolderState.concat("_sep_").concat(uuidRoomObj.roomUUIDProperty)).set(fileRef);
                    
                    //reference of the folder node
                    let folderRef = await gunInstance.get(finalInputFolderState.concat("_sep_").concat(uuidRoomObj.roomUUIDProperty))
                    
                    //Inserting the reference of the folder node into groupUUID list of folder names
                    await gunInstance.get("foldersMetadata_".concat(uuidRoomObj.roomUUIDProperty)).set(folderRef);

                    //Creating an individual node as an item of another node for the search box
                    let fileItemRef = await gunInstance.get(`${fileName}_${uuidRoomObj.roomUUIDProperty}_searchItem`).put({
                        filenameProperty: fileName, 
                        filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                        CID_prop: CID, 
                        fileKey: encJSONKey, 
                        iv: encIV, 
                        fileType: getFileType,
                        date: lastModdifiedVar,
                        uploadedBy: myAlias,
                        accessType: "shared",
                        location: `${finalInputFolderState}`
                    })

                    await gunInstance.get(`${uuidRoomObj.roomUUIDProperty}_nodeSearchItemsSet`).set(fileItemRef);



                }else if(folderItemChosen != null && (inputFolderState === null || inputFolderState === undefined) ){
                    alert("Folder selected");
                    await gunInstance.get(folderItemChosen.folderNameNodeFull).set(fileRef);

                    // For the search box
                    let fileItemRef = await gunInstance.get(`${fileName}_${uuidRoomObj.roomUUIDProperty}_searchItem`).put({
                        filenameProperty: fileName, 
                        filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                        CID_prop: CID, 
                        fileKey: encJSONKey, 
                        iv: encIV, 
                        fileType: getFileType,
                        date: lastModdifiedVar,
                        uploadedBy: myAlias,
                        accessType: "shared",
                        location: `${folderItemChosen.folderNameClean}`
                    })

                    await gunInstance.get(`${uuidRoomObj.roomUUIDProperty}_nodeSearchItemsSet`).set(fileItemRef);
                    

                } else if (folderItemChosen != null && inputFolderState.length > 0){
                    alert("Folder selected");
                    let finalInputFolderState = inputFolderState.replaceAll(" ", "_");
                    //Inserting unique node into an actual "folder" node
                    await gunInstance.get(finalInputFolderState.concat("_sep_").concat("_subfolder_").concat(uuidRoomObj.roomUUIDProperty)).set(fileRef);

                    //reference of the folder node
                    let folderRef = await gunInstance.get(finalInputFolderState.concat("_sep_").concat("_subfolder_").concat(uuidRoomObj.roomUUIDProperty));

                    //Inserting the reference of the folder node into groupUUID list of folder names
                    await gunInstance.get(folderItemChosen.folderNameNodeFull).set(folderRef);

                    // For the search box
                    let fileItemRef = await gunInstance.get(`${fileName}_${uuidRoomObj.roomUUIDProperty}_searchItem`).put({
                        filenameProperty: fileName, 
                        filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                        CID_prop: CID, 
                        fileKey: encJSONKey, 
                        iv: encIV, 
                        fileType: getFileType,
                        date: lastModdifiedVar,
                        uploadedBy: myAlias,
                        accessType: "shared",
                        location: `${finalInputFolderState}`
                    })

                    await gunInstance.get(`${uuidRoomObj.roomUUIDProperty}_nodeSearchItemsSet`).set(fileItemRef);
                    

                }


                alert("FILE ADDED");
                handleClose();        
            }).catch(console.error);

        });

        
    }

    async function GenerateNotificationNode(alias, date, message){
        await gunInstance.get(`${alias}_generalNotificationItem_${date}`).put({
            message: message,
            date: date
        })
        let notifNodeRef1 = await gunInstance.get(`${alias}_generalNotificationItem_${date}`);

        await gunInstance.get(`${alias}_generalPublicNotificationNode`).set(notifNodeRef1);
        
    }
    
    async function secondOption(holder1, holder2, holder3){
        //Copy of the SEA pair of the current room
        let seaPairTeamRoom;
        let seaPairTeamRoomParsed;
        await userInstance.get("my_team_rooms").map().once(async data => {
            delete data._;
            if(data.nameOfRoom === uuidRoomObj.roomName){
                seaPairTeamRoom = data.roomSEA;
                alert(seaPairTeamRoom);
                console.log(typeof seaPairTeamRoom);

                console.log(JSON.parse(seaPairTeamRoom));
                console.log(typeof JSON.parse(seaPairTeamRoom));
                seaPairTeamRoomParsed = JSON.parse(seaPairTeamRoom);
            }
        });

        let fileName, fileNameNoWhiteSpace, lastModdifiedVar, CID, fileFormat, exportedKey, myAlias;
        await userInstance.get('alias').on(v => myAlias = v);
        const fr = new FileReader();

        const getFileType = fileUploadGroup.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
        fileName = fileUploadGroup.current.files[0].name;
        fileNameNoWhiteSpace = fileUploadGroup.current.files[0].name.replaceAll(" ", "");
        lastModdifiedVar = fileUploadGroup.current.files[0].lastModifiedDate;
        lastModdifiedVar = lastModdifiedVar.toString(); // convert it to string because gun.js wouldn't accept it.

        fr.readAsArrayBuffer(fileUploadGroup.current.files[0]); // convert file blob into ArrayBuffer

        fr.addEventListener('load', async (e)=>{
            alert(JSON.stringify(seaPairTeamRoomParsed));
            
           //Result of fr.readAsArrayBuffer
            let data = e.target.result; // e.target.result is similar to fr.result
            let iv = crypto.getRandomValues(new Uint8Array(16));
            const key = await generateKeyFunction();
           
            //Actual encryption of the raw ArrayBuffer
            crypto.subtle.encrypt({ 'name': 'AES-CBC', iv }, key, data)
            .then(async encrypted => {
                console.log(encrypted); // "encrypted" is an encrypted ArrayBuffer
                alert('The encrypted data is ' + encrypted.byteLength + ' bytes long'); // encrypted is an ArrayBuffer
                fileFormat = new File([encrypted], fileNameNoWhiteSpace, {type: getFileType, lastModified: lastModdifiedVar} ) // convert encrypted arraybuffer to blob.
                console.log("ENCRYPTED:");
                console.log(fileFormat);
                console.log("KEY USED TO ENCRYPT FILE");
                console.log(key);
                const fileInArray = [fileFormat]; // put fileFormat inside an array for web3storage API to accept the file blob
                console.log(fileInArray);
                //Export CryptoKey in a JSON web key format
                exportedKey = await crypto.subtle.exportKey("jwk", key);
                let parsedExportedKey = JSON.stringify(exportedKey, null, " ");

                let parsedInitializationVector = window.btoa(String.fromCharCode.apply(null, iv)); // convert the initialization vector into base64-encoded data to be inserted into the gun node graph
                console.log(parsedInitializationVector);
                let encIV = await SEA.encrypt(parsedInitializationVector, seaPairTeamRoomParsed); // encrypt the base64-encoded data (IV)
                console.log(encIV);

                console.log(parsedExportedKey);

               let shareHolderObject = {
                   holder1: holder1,
                   holder2: holder2,
                   holder3: holder3
               }
               console.log(shareHolderObject);
               alert("The next alert is the stringified of shareHolderObj");
               alert(JSON.stringify(shareHolderObject));
               //let seaPairTeamRoomJSON = JSON.stringify(seaPairTeamRoom);
               //let stringifiedShareHolderObject = JSON.stringify(shareHolderObject);

               
                Axios.post("https://floating-fjord-99601.herokuapp.com/secret", {
                       exportedKey: parsedExportedKey,
                       seaPairTeamRoom: seaPairTeamRoomParsed,
                       shareHolders: shareHolderObject
                   } ).then(async (Response)=>{
                    alert("FOLLOWING ALERT ARE RESPONSES");
                           alert(Response.data.ResponseMessage[0]);
                           alert(Response.data.ResponseMessage[1]);
                           alert(Response.data.ResponseMessage[2]);
                           const res_CID = await client.put(fileInArray);
                           let CID = res_CID;
                           
/*                             await gunInstance.get("vc_".concat(fileName).concat(uuidRoomObj.roomUUIDProperty)).set({                    
                               filenameProperty: fileName, 
                               filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                               CID_prop: CID, 
                               fileKey: encJSONKey, 
                               iv: encIV, 
                               fileType: getFileType,
                               date: lastModdifiedVar,
                               uploadedBy: myAlias
                           }) */
                           

                           //Individual UNIQUE node containing file metadata
                            let fileRef = await gunInstance.get(fileName.concat(uuidRoomObj.roomUUIDProperty)).put({                    
                               filenameProperty: fileName, 
                               filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
                               CID_prop: CID, 
                               holder1: holder1.memberAlias,
                               holder2: holder2.memberAlias, 
                               holder3: holder3.memberAlias,
                               holder1Epub: holder1.memberEpub,
                               holder2Epub: holder2.memberEpub,
                               holder3Epub: holder3.memberEpub,
                               encShare1: Response.data.ResponseMessage[0],
                               encShare2: Response.data.ResponseMessage[1],
                               encShare3: Response.data.ResponseMessage[2],
                               iv: encIV, 
                               fileType: getFileType,
                               date: lastModdifiedVar,
                               uploadedBy: myAlias,
                               accessType: "secretShare"
                           });

                           if(folderItemChosen === null){
                               alert("No Folder selected");
                               let finalInputFolderState = inputFolderState.replaceAll(' ','_');
                               await gunInstance.get(finalInputFolderState.concat("_sep_").concat(uuidRoomObj.roomUUIDProperty)).set(fileRef);
                               
                               //reference of the folder node
                               let folderRef = await gunInstance.get(finalInputFolderState.concat("_sep_").concat(uuidRoomObj.roomUUIDProperty))
                               
                               //Inserting the reference of the folder node into groupUUID list of folder names
                               await gunInstance.get("foldersMetadata_".concat(uuidRoomObj.roomUUIDProperty)).set(folderRef);
                           }

                           else if(folderItemChosen != null && (inputFolderState === null || inputFolderState === undefined)){
                               alert("Folder selected");
                               await gunInstance.get(folderItemChosen.folderNameNodeFull).set(fileRef);
           
                           } else if (folderItemChosen != null && inputFolderState.length > 0){
                               alert("Folder selected");
                               let finalInputFolderState = inputFolderState.replaceAll(" ", "_");
                                   //Inserting unique node into an actual "folder" node
                               await gunInstance.get(finalInputFolderState.concat("_sep_").concat("_subfolder_").concat(uuidRoomObj.roomUUIDProperty)).set(fileRef);
           
                               //reference of the folder node
                               let folderRef = await gunInstance.get(finalInputFolderState.concat("_sep_").concat("_subfolder_").concat(uuidRoomObj.roomUUIDProperty));
           
                               //Inserting the reference of the folder node into groupUUID list of folder names
                               await gunInstance.get(folderItemChosen.folderNameNodeFull).set(folderRef);
                           }
                           let dateJSON = new Date().toJSON();

                           //Send Holder 1 notification
                           await GenerateNotificationNode(holder1.memberAlias, dateJSON, `A secret share from ${myAlias} was assigned to you.`);
                           //Send Holder 2 notification
                           await GenerateNotificationNode(holder2.memberAlias, dateJSON, `A secret share from ${myAlias} was assigned to you.`);
                           //Send Holder 3 notification
                           await GenerateNotificationNode(holder3.memberAlias, dateJSON, `A secret share from ${myAlias} was assigned to you.`);

                           alert("FILE ADDED");
                           handleClose();
                           window.location.reload();
                });


            }).catch(console.error);

        });


        
 // END LINE
        
    }
    async function handleUploadGroup(event){
        event.preventDefault();
        console.log("SELECTED FOLDER AS PARENT OF THE FOLDE SPECIFIED");
        console.log(folderItemChosen);
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
                let temp1 = null, temp2 = null, temp3 = null;

                filteredMemberList().map((elem)=>{
                    console.log(elem);
                    if(elem.memberAlias == shareHolder1){
                        temp1 = elem;
                    } else if(elem.memberAlias === shareHolder2){
                        temp2 = elem;
                    } else if (elem.memberAlias === myAlias){
                        temp3 = elem;
                    }
                 })
                 if (temp1 === null){
                    alert(`${shareHolder1} doesn't exist! Try again.`);
                    return;
                } else if (temp2 === null){
                    alert(`${shareHolder2} doesn't exist! Try again.`);
                    return;
                }
                secondOption(temp1, temp2, temp3);
                break;
            default:
                alert("Select one of the options!");
                break;
        }
/*         
         */
    }
    
    async function handleSelectedFolderItem(event, elem){
        event.preventDefault();
        setFolderItemChosen({folderNameNodeFull: elem.folderNameNodeFull, folderNameClean: elem.folderNameClean});
/*         if(isFolderSelectedState.isSelected){
            setIsFolderSelectedState({isSelected: false, indexProp: null}); 
            setIsFolderSelectedState({isSelected: true, indexProp: index}); 
        }

        else{
            setIsFolderSelectedState({isSelected: true, indexProp: index}); 
        } */
    }

    async function showFoldersHandler(){
        console.log("Test handler");
        let arrayList = [];
          filteredFolderListHandler().map((element, index)=>{
            console.log("-----------------------------ITERATION (OUTER) -----------------------------")
            arrayList.push(element);
  
          })
  
          setFolderListToRender(arrayList);
    }
    return (
        <div className={toggleClassname}>
            <div className="upload-group-modal-box">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>
                <div className="upload-group-input-box">
                    <div className="folderTree-grid-cell">
                        <button onClick={showFoldersHandler}>Show Folders</button>
                        <div className="folder-list-tree-container">
{/*                             <ul>
                                    {folderListToRender.map((elem, index)=>
                                    <li key={index} className={(isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? "folder-item-css-active" : "folder-item-css"} onClick={() => { alert(elem.folderNameNodeFull); handleSelectedFolderItem(index); setFolderItemChosen(elem.folderNameNodeFull)} }>
                                        {console.log(elem)}
                                        <img src={(isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? folderIconSelected : folderIcon} height="33px" width="33px"></img>
                                        <p>{elem.folderNameClean}</p>
                                        {elem.itemsProp.length > 0 && <SubfolderRender element={elem.itemsProp} index={index} />}
                                    </li>
                                    )}
                            </ul> */}
                            <ul>
                                    {folderListToRender.map((elem, index)=>
                                    <li key={index} >
                                        <div className={/* (isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? "folder-item-css-active" :  */"folder-item-css"}  onClick={(e) => { alert(elem.folderNameClean); handleSelectedFolderItem(e, elem);} }>
                                            {console.log(elem)}
                                            <img src={/* (isFolderSelectedState.isSelected && isFolderSelectedState.indexProp === index) ? folderIconSelected :  */folderIcon} height="33px" width="33px"></img>
                                            <p>{elem.folderNameClean}</p>
                                        </div>
                                        {elem.itemsProp.length > 0 && <SubfolderRender element={elem.itemsProp} handleSelectedFolderItem={handleSelectedFolderItem} />}

                                    </li>
                                    )}
                            </ul>
                        </div>
                    </div>
                    <div className="form-upload-grid-cell">
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
                                    <p className="ss-option-description-css">(Specify which user can decrypt the file later on)</p>
                                </div>
                            </div>
                        </div>
                        <div className="location-node-box">
{/*                             <div className="foldername-textbox-box">
                                <label>Parent Folder Name: </label>
                                <input type="text" className="textbox-foldername" defaultValue={folderItemProp === null ? "" : folderItemProp} id="age2" name="age" onChange={(e) => setInputParentFolderState(e.target.value)} placeholder="Enter parent folder name" />
                            </div> */}
                            <div className="parent-foldername-box">
                                <label>Parent Folder: <b>{folderItemChosen === null ? "No Parent Folder Selected" : folderItemChosen.folderNameClean}</b></label>
                                <button className={folderItemChosen === null ? "button-display-none-parent-folder-btn" : "button-display-parent-folder-btn"} onClick={(e) => setFolderItemChosen(null)}>Clear Parent Folder</button>
                            </div>
                            <div className="foldername-textbox-box">
                                <label>Folder Name: </label>
                                <input type="text" className="textbox-foldername" id="age2" name="age" onChange={(e) => setInputFolderState(e.target.value)} placeholder="Enter folder name" />
                            </div>
                        </div>
                        <div className="upload-btn-box">
                            <button type="submit" className="submit-btn-upload-group" onClick={(e) => handleUploadGroup(e)}  >Upload Document</button>
                        </div>
                    </div> 
                </div>
            </div>
        </div>
    )
}