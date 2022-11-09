import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'

import { SEA } from "gun";

import './folder-component.css';

import RequestShareModalComponent from "../modal-components/RequestShareModal";

// useReducer for shared documents
const currentDocumentListState = {
    documents: []
}

const documentsUseReducerHandler = (documentListState, document)=>{
    if(document.reset){
        return {
            documents: []
        }
    }
    return {
        documents: [document, ...documentListState.documents]
    }
}

// useReducer for shared documents
const currentDocumentSecretSharedListState = {
    documentsSecretSharedArrayState: []
}

const documentsSecretSharedUseReducerHandler = (documentSecretSharedListState, documentSecretShared)=>{
    if(documentSecretShared.reset){
        return {
            documentsSecretSharedArrayState: []
        }
    }
    return {
        documentsSecretSharedArrayState: [documentSecretShared, ...documentSecretSharedListState.documentsSecretSharedArrayState]
    }
}

// useReducer for version control
const currentVCState ={
    vcArray: []
}

const vcUseReducerHandler = (vcListState, version)=>{
    if(version.reset){
        return {
            vcArray: []
        }
    }
    return {
        vcArray: [version, ...vcListState.vcArray]
    }
}


export default function FolderComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let [SEAState, setSEA] = useState('');
    let [myAlias, setMyAlias] = useState('');

    let [isVcSidebarViews, setIsVcSidebarViews] = useState(false);

    //state for the folderContext
    let [folderContextState, setFolderContextState] = useState();

    //usereducer for documents/files
    let [vcListState, dispatchvcListState] = useReducer(vcUseReducerHandler, currentVCState);

    //useReducer for documents/files (shared)
    let [documentListState, documentsDispatch] = useReducer(documentsUseReducerHandler, currentDocumentListState);

    //useReducer for documents/files (shared)
    let [documentListStateSecretSharedState, documentsSecretSharedDispatch] = useReducer(documentsSecretSharedUseReducerHandler, currentDocumentSecretSharedListState);

    //Get the metadata of the selected document
    let [documentSelectedState, setDocumentSelectedState] = useState({});
    
    //Track which item is selected or clicked.
    let [itemSelected, setItemSelected] = useState({index: -1, isSelected: false, fileNameVar: ''});

    //State to toggle the request share modal component
    let [isRequestShareModalViewed, setIsRequestShareModalViewed] = useState(false);
    async function showShareRequestModal(elem){
        setIsRequestShareModalViewed(true);
        setHoldSecretSharedObject(elem);

    }
    function hideShareRequestModal(){
        setIsRequestShareModalViewed(false);
    }

    //State to hold the secret shared document metadata object to be passed on the RequestShareModal component
    let [holdSecretSharedObject, setHoldSecretSharedObject] = useState();


    let navigate = useNavigate();
    async function gunHandlerCall(){

        
    }
    useEffect(()=>{
            documentsDispatch({reset: true});
            documentsSecretSharedDispatch({reset: true});
            userInstance.get("alias").on(async data => {
                setMyAlias(data);
            });
    
             userInstance.get("my_team_rooms").map().once(data=>{
                delete data._;
                console.log(data);
                if(data.uuidOfRoom === roomUUIDObj.roomUUIDProperty){
                    console.log(data.roomSEA);
                    setSEA(data.roomSEA);
                }
            })
            console.log(folderContext.folderNameNodeFull);
            gunInstance.get(folderContext.folderNameNodeFull).map().once(data =>{
                //get the property name of the unique node containing the individual file's metadata
                //let getFileNameRoomUUIDProperty = data.filenameProperty.concat(roomUUIDObj.roomUUIDProperty);
                console.log(data);
                let getFileName = data.filenameProperty;
                let getFileType = data.fileType;
                let getAccessType = data.accessType;
                let CID = data.CID_prop;
                let date = data.date;
                console.log({ 
                    filename: getFileName, 
                    fileType: getFileType, 
                    accessType: getAccessType, 
                    cid: CID, 
                    date: date
                })
                if(data.accessType === "secretShare"){
                    documentsSecretSharedDispatch({
                        filename: getFileName, 
                        fileType: getFileType, 
                        accessType: getAccessType, 
                        cid: CID, 
                        date: date,
                        holder1Alias: data.holder1,
                        holder2Alias: data.holder2, 
                        holder3Alias: data.holder3,
                        holder1Epub: data.holder1Epub,
                        holder2Epub: data.holder2Epub,
                        holder3Epub: data.holder3Epub,
                        encShare1: data.encShare1,
                        encShare2: data.encShare2,
                        encShare3: data.encShare3,
                    })
                }
                else if (data.accessType === "shared"){
                    documentsDispatch({ 
                        filename: getFileName, 
                        fileType: getFileType, 
                        accessType: getAccessType, 
                        cid: CID, 
                        date: date
                    });
                }
            })
            gunHandlerCall();
    }, [folderContext])

    
    // Remove duplicated documents from the "documents" property in the documentListState and get only objects with access type of "shared".
    const filteredSharedDocumentsList = () =>{
        console.log("filtered shared documents function called")
        const filteredDocumentList = documentListState.documents.filter((value, index) => {
            console.log(value);
            const _value = JSON.stringify(value);
            return (
                index ===
                documentListState.documents.findIndex(obj => {
                return JSON.stringify(obj) === _value
                }) && value.accessType === "shared"
            )
        })

        return filteredDocumentList;
    }

    // Remove duplicated documents from the "documents" property in the documentListState and get only objects with access type of "secretShare".
    const filteredSecretSharedDocuments = () =>{
            console.log("filtered SECRET shared documents function called")
            const filteredDocumentList = documentListStateSecretSharedState.documentsSecretSharedArrayState.filter((value, index) => {
                console.log(value);
                const _value = JSON.stringify(value);
                return (
                    index ===
                    documentListStateSecretSharedState.documentsSecretSharedArrayState.findIndex(obj => {
                    return JSON.stringify(obj) === _value
                    }) && value.accessType === "secretShare"
                )
            })
    
            return filteredDocumentList;
        }

    function handleItemSelected(elem, index, fileNameVar){

        //Check if an item is currently selected or not.
        if(itemSelected.isSelected){

            setItemSelected({isSelected: false, index: -1, fileNameVar: elem.filename})
            setDocumentSelectedState({});
            //This part is for when a user tries to click a different item/document
            setDocumentSelectedState(elem); 
            setItemSelected({isSelected: true, index: index, fileNameVar: elem.filename})


        } else{

            setDocumentSelectedState(elem); 
            setItemSelected({isSelected: true, index: index,  fileNameVar: elem.filename})
        }
    }


    async function handleDownloadSharedFile(){
        alert("Downloading file\nPlease wait for a few moments.\nYour document will download automatically");
        console.log(documentSelectedState);
        await gunInstance.get(documentSelectedState.filename.concat(roomUUIDObj.roomUUIDProperty)).once( async data =>{
            console.log(data);
            let filename = data.filenameProperty;
            let filenameWithNoWhiteSpace = data.filenameWithNoWhiteSpace;
            let CID = data.CID_prop;
            let fileType = data.fileType;
            
            //Get the SEA pair of the team room
            //SEAState value is in JSON format, parse it.
            let parsedSEAState = JSON.parse(SEAState);

            //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
            let decryptedIVBase64 = await SEA.decrypt(data.iv, parsedSEAState);
            const decodedb64Uint8Array  = window.atob(decryptedIVBase64); //Decode base64-encoded string back into Uint8Array
            const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
            const ivUint8Array = new Uint8Array(buffer);
            for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
            }


            //Decrypt the parsedExportedKey using the SEA.pair() of the team room.
            let decryptedKey = await SEA.decrypt(data.fileKey, parsedSEAState);
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

    }



    async function downloadSecretShared(elem){
        
    }

async function queryVersion(){
    let filenameX = documentSelectedState.filename;
    await gunInstance.get("vc_".concat(filenameX).concat(roomUUIDObj.roomUUIDProperty)).map().once(async data=>{
        console.log(data);
        dispatchvcListState({
            filenameProperty: data.filenameProperty, 
            filenameWithNoWhiteSpace: data.filenameWithNoWhiteSpace, 
            CID_prop: data.CID_prop, 
            fileKey: data.fileKey, 
            iv: data.iv, 
            fileType: data.fileType,
            date: data.date,
            uploadedBy: data.uploadedBy
        })
    })

}

const filteredVCList = () =>{
    console.log("filtered shared documents function called")
    const filteredVC = vcListState.vcArray.filter((value, index) => {
        console.log(value);
        const _value = JSON.stringify(value);
        return (
            index ===
            vcListState.vcArray.findIndex(obj => {
            return JSON.stringify(obj) === _value
            })
        )
    })

    return filteredVC;
}
    return (
        <div>
            {isRequestShareModalViewed && <RequestShareModalComponent seaPairRoomProp={SEAState} secretSharedDocumentObj={holdSecretSharedObject} roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideShareRequestModal} show={isRequestShareModalViewed}/> }
            <div className="top-toolbar-folder" >
                <div className="top-toolbar-nav-folder">
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main")}><p>Team Rooms</p></button>
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/room")}> <p className="btn-room-css">{roomUUIDObj.roomName}</p></button>
                    <button className="btn-navigate-folder btn-selected"><p className="btn-room-css">{folderContext.folderNameClean}</p></button>
                </div>
                <div className={itemSelected.isSelected === true ? "top-toolbar-option-document" : "top-toolbar-option-document-hide"}>
                    <p className="label-item-selected"><b>{itemSelected.fileNameVar} - </b></p>
                    <button className="btn-option-document-css" onClick={()=> handleDownloadSharedFile()}>Download</button>
                    <button className="btn-option-document-css" /* onClick={()=> navigate("/main/Teams/room")} */>Delete</button>
                    <button className="btn-option-document-css" onClick={()=> {setIsVcSidebarViews(!isVcSidebarViews); queryVersion()} }>Check Versions</button>
                    <button className="btn-option-document-css" onClick={()=> { setItemSelected({isSelected: false, index: -1}); dispatchvcListState({reset: true}); }}>Cancel</button>
                    
                </div>
            </div>
            <div className="top-folder-container" >
                <div className="secret-share-docs-container">
                    <h3>Protected Documents:  (Secret Share Security)</h3>
                    <br></br>
                    <table className="table-container">
                        <thead className="table-row-container">
                        <tr>
                            <th><p className="table-header-label-css">Document Name</p></th>
                            <th><p className="table-header-label-css">Content Identifier (CID)</p></th>
                            <th><p className="table-header-label-css">Date of Upload (Last modified)</p></th>
                        </tr>
                        </thead>
                        <tbody>
                        {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                            {filteredSecretSharedDocuments().map((elem, index) =>
                            <tr className="table-row-css">
                            <td><p className="table-data-label-css">{elem.filename}</p></td>
                            <td><p className="table-data-label-css cid-label-css">{elem.cid}</p></td>
                            <td><p className="table-data-label-css">{elem.date}</p></td>
                            <td><button className="download-btn" onClick={() => showShareRequestModal(elem)}>Request for all shares</button></td>
{/*                             <td><button className="download-btn" onClick={() => downloadSecretShared(elem)}>Download Document</button></td>
 */}                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
                <div className="shared-docs-container">
                        <h3>Shared Documents: </h3>
                        <div className="folder-list-flex-container">
                            {filteredSharedDocumentsList().map((elem, index)=>
                                <div className={itemSelected.isSelected && itemSelected.index === index ? "item-selected" : "document-item"} key={index} onClick={ () => handleItemSelected(elem, index) }>
                                    <img  className='icon-document' src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file }/>
                               
                                    <p>{elem.filename}</p>
                                </div>
                            )}

                        </div>
                </div>
                <div className="vc-container">
                    <h3>Version Control</h3>
                    <p className="vc-sidebar-subtitle">Click on a file to check all of its different versions</p>
                    <br></br>
                    <table className="table-container-vc">
                        <thead className="table-row-container">
                        <tr>
                            <th><p className="table-header-label-css">Document Name</p></th>
                            <th><p className="table-header-label-css">Content Identifier (CID)</p></th>
                            <th><p className="table-header-label-css">Date of Upload (Last modified)</p></th>
                        </tr>
                        </thead>
                        <tbody>
                            {filteredVCList().map((elem, index)=>
                                    <tr className="table-row-css" key={index}>
                                        <td><p className="table-data-label-css">{elem.filenameProperty}</p></td>
                                        <td><p className="cid-label-css">{elem.CID_prop}</p></td>
                                        <td><p className="table-data-label-css">{elem.date}</p></td>
                                        <td><button className="download-btn" onClick={() => handleDownloadSharedFile(elem)}>Download Document</button></td>
                                    </tr>
                                )}
                        </tbody>
                    </table>
                </div>
            </div>


    </div>
        
    )
}

