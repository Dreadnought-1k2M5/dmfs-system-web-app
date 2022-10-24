import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'

import { SEA } from "gun";

import './folder-component.css';

// useReducer
const currentDocumentListState ={
    documents: []
}

const documentsUseReducerHandler = (documentListState, document)=>{
    return {
        documents: [document, ...documentListState.documents]
    }
}


export default function FolderComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let [SEAState, setSEA] = useState('');

    //useReducer for documents/files
    let [documentListState, documentsDispatch] = useReducer(documentsUseReducerHandler, currentDocumentListState);

    //Get the metadata of the selected document
    let [documentSelectedState, setDocumentSelectedState] = useState({});
    
    //Track which item is selected or clicked.
    let [itemSelected, setItemSelected] = useState({index: -1, isSelected: false});

    let navigate = useNavigate();
    useEffect(()=>{
            userInstance.get("my_team_rooms").map().once(data=>{
                delete data._;
                console.log(data);
                if(data.uuidOfRoom === roomUUIDObj.roomUUIDProperty){
                    console.log(data.roomSEA);
                    setSEA(data.roomSEA);
                }
            })
            gunInstance.get(folderContext.folderName.concat(roomUUIDObj.roomUUIDProperty)).map().on(data =>{
            //get the property name of the unique node containing the individual file's metadata
            let getFileNameRoomUUIDProperty = data.filenameProperty.concat(roomUUIDObj.roomUUIDProperty);
            let getFileName = data.filenameProperty;
            let getFileType = data.fileType;
            console.log(getFileNameRoomUUIDProperty);
            console.log(getFileName)
            documentsDispatch({fileNameUUID: getFileNameRoomUUIDProperty, filename: getFileName, fileType: getFileType});
        })
    }, [])

    
    // Remove duplicated documents from the "documents" property in the documentListState.
    const filteredDocumentsList = () =>{
        console.log("filtered documents function called")
        const filteredDocumentList = documentListState.documents.filter((value, index) => {
            const _value = JSON.stringify(value);
            return (
                index ===
                documentListState.documents.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return filteredDocumentList;
    }

    function handleItemSelected(elem, index){

        //Check if an item is currently selected or not.
        if(itemSelected.isSelected){
            setItemSelected({isSelected: false, index: -1})
            setDocumentSelectedState({});

            //This part is for when a user tries to click a different item/document
            setDocumentSelectedState(elem); 
            setItemSelected({isSelected: true, index: index})
        } else{
            setDocumentSelectedState(elem); 
            setItemSelected({isSelected: true, index: index})
        }
    }


    async function handleDownloadSharedFile(){
        console.log(documentSelectedState);
        await gunInstance.get(documentSelectedState.fileNameUUID).once( async data =>{
            console.log(data);
            let filename = data.filenameProperty;
            let filenameWithNoWhiteSpace = data.filenameWithNoWhiteSpace;
            let CID = data.CID_prop;
            let fileType = data.fileType;

            //Retrieve team room SEA pair


            console.log(SEAState);
            //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
            let decryptedIVBase64 = await SEA.decrypt(data.iv, SEAState);
            const decodedb64Uint8Array  = window.atob(decryptedIVBase64, decryptedIVBase64);
            const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
            const ivUint8Array = new Uint8Array(buffer);
            for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
            }

            //Decrypt the parsedExportedKey using the SEA.pair() of the team room.
            let decryptedKey = await SEA.decrypt(data.fileKey, SEAState);
            console.log(decryptedKey);
            //Idk why the fuck this line doesn't work but the decryption process works without it.
            //The value of 'decryptedKey' was supposed to be a JSON string, but it wasn't for some reason.
            //let jsonParseFileKey = await JSON.parse(decryptedJSON);

            await crypto.subtle.importKey("jwk", decryptedKey, { 'name': 'AES-CBC' }, true, ['encrypt', 'decrypt']).then(cryptoKeyImported =>{
                fetch(`https://${CID}.ipfs.w3s.link/ipfs/${CID}/${filenameWithNoWhiteSpace}`).then(res => {
                    let result = res.blob(); // Convert to blob() format
                    console.log(result);
                    return result;
                }).then(async res => {
            
                    // Convert blob to arraybuffer
                    const fileArrayBuffer = await new Response(res).arrayBuffer();
        
                    await window.crypto.subtle.decrypt({name: 'AES-CBC', iv: ivUint8Array}, cryptoKeyImported, fileArrayBuffer).then(decrypted => {
                        //Convert ArrayBuffer to Blob and Download
                        const blob = new Blob([decrypted], {type: fileType} ) // convert decrypted arraybuffer to blob.
                        const aElement = document.createElement('a');
                        aElement.setAttribute('download', `${filename}`);
                        const href = URL.createObjectURL(blob);
                        aElement.href = href;
                        aElement.setAttribute('target', '_blank');
                        aElement.click();
                        URL.revokeObjectURL(href);
            
                    }).catch(console.error);
                    
                })
            
                })
        })
        /* 
        



         */
    }

    return (
        <div>
            <div className="top-toolbar-folder" >
                <div className="top-toolbar-nav-folder">
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/Teams")}>Team Rooms</button>
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/Teams/room")}>{roomUUIDObj.roomName}</button>
                    <button className="btn-navigate-folder btn-selected">{folderContext.folderName}</button>
                </div>
                <div className={itemSelected.isSelected === true ? "top-toolbar-option-document" : "top-toolbar-option-document-hide"}>
                    <button className="btn-navigate-folder" onClick={()=> handleDownloadSharedFile()}>Download</button>
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/Teams/room")}>Delete</button>
                    <button className="btn-navigate-folder" onClick={()=> setItemSelected({isSelected: false, index: -1})}>Cancel</button>
                </div>
            </div>
            <div className="top-folder-container" >
            <h1>{folderContext.folderName}</h1>
            <br></br>
            <div className="folder-list-flex-container">
                {filteredDocumentsList().map((elem, index)=>
                    <div className={itemSelected.isSelected && itemSelected.index === index ? "item-selected" : "document-item"} key={index} onClick={ () => handleItemSelected(elem, index) }>
                        <img  className='icon-document' src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file }/>
                        <p>{elem.filename}</p>
                    </div>
                )}
            </div>

        </div>
        </div>
        
    )
}