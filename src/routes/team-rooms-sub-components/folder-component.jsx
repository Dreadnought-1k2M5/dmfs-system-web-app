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

// useReducer for version control
const currentVCState ={
    vcArray: []
}

const vcUseReducerHandler = (vcListState, version)=>{
    return {
        vcArray: [version, ...vcListState.vcArray]
    }
}


export default function FolderComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let [SEAState, setSEA] = useState('');
    let [myAlias, setMyAlias] = useState('');

    let [isVcSidebarViews, setIsVcSidebarViews] = useState(false);

    //usereducer for documents/files
    let [vcListState, dispatchvcListState] = useReducer(vcUseReducerHandler, currentVCState);

    //useReducer for documents/files
    let [documentListState, documentsDispatch] = useReducer(documentsUseReducerHandler, currentDocumentListState);

    //Get the metadata of the selected document
    let [documentSelectedState, setDocumentSelectedState] = useState({});
    
    //Track which item is selected or clicked.
    let [itemSelected, setItemSelected] = useState({index: -1, isSelected: false, fileNameVar: ''});

    let navigate = useNavigate();
    useEffect(()=>{
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

            gunInstance.get(folderContext.folderName.concat(roomUUIDObj.roomUUIDProperty)).map().once(data =>{
                //get the property name of the unique node containing the individual file's metadata
                //let getFileNameRoomUUIDProperty = data.filenameProperty.concat(roomUUIDObj.roomUUIDProperty);
                let getFileName = data.filenameProperty;
                let getFileType = data.fileType;
                let getAccessType = data.accessType;
                let CID = data.CID_prop;
                let date = data.date;
                let getshareHoldersList = data.shareHoldersList; //ShareHodlerList is a reference to an individual unique node

                //console.log(getFileNameRoomUUIDProperty);
                console.log(getFileName)
                documentsDispatch({ filename: getFileName, fileType: getFileType, accessType: getAccessType, cid: CID, date: date, shareHoldersList: getshareHoldersList});
            })

    }, [])

    
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
            const filteredDocumentList = documentListState.documents.filter((value, index) => {
                console.log(value);
                const _value = JSON.stringify(value);
                return (
                    index ===
                    documentListState.documents.findIndex(obj => {
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

    }

    async function HandleRequestShare(elem){
        let holder1, holder2, holder3;
        await gunInstance.get(elem.shareHoldersList).once(data => {
            holder1 = data.holder1;
            holder2 = data.holder2;
            holder3 = data.holder3;
        })
        console.log(holder1);
        console.log(holder2);
        console.log(holder3);

        //holder 1 node
        let refNode1 = await gunInstance.get(holder1.concat("_shareRequestNode_").concat(myAlias)).put({
            requestor: myAlias,
            requestorEpub: userInstance._.sea.epub,
            shareHolder: holder1,
            filename: elem.filename
        })
        let refNode2 = await gunInstance.get(holder2.concat("_shareRequestNode_").concat(myAlias)).put({
            requestor: myAlias,
            requestorEpub: userInstance._.sea.epub,
            shareHolder: holder2,
            filename: elem.filename
        })
        let refNode3 = await gunInstance.get(holder3.concat("_shareRequestNode_").concat(myAlias)).put({
            requestor: myAlias,
            requestorEpub: userInstance._.sea.epub,
            shareHolder: holder3,
            filename: elem.filename
        })

        await gunInstance.get(holder1.concat("publicNodeRequestList")).set(refNode1);
        await gunInstance.get(holder2.concat("publicNodeRequestList")).set(refNode2);
        await gunInstance.get(holder3.concat("publicNodeRequestList")).set(refNode3);

/*         await gunInstance.get(myAlias.concat("_").concat(holder1).concat("responseNode")).on(async data1 =>{
            if(data1.isAuthorized){
                await gunInstance.get(myAlias.concat("_").concat(holder2).concat("responseNode")).on(async data2 =>{
                    if(data2.isAuthorized){
                        await gunInstance.get(myAlias.concat("_").concat(holder3).concat("responseNode")).on(async data3 =>{
                            if(data3.isAuthorized){
                                
                                let secreKey1 = await SEA.secret(data1.holderEpub, userInstance._.sea);
                                let secreKey2 = await SEA.secret(data2.holderEpub, userInstance._.sea);
                                let secreKey3 = await SEA.secret(data3.holderEpub, userInstance._.sea);
                                
                                let decrypt1 = await SEA.decrypt(data1.encryptedShare, secreKey1);
                                let decrypt2 = await SEA.decrypt(data2.encryptedShare, secreKey2);
                                let decrypt3 = await SEA.decrypt(data3.encryptedShare, secreKey3);

                                console.log(decrypt1.concat(decrypt2).concat(decrypt3));
                            }
                        })
                    }
                })
            }
        }) */

    }

    async function downloadSecretShared(elem){
        let holder1, holder2, holder3;
        await gunInstance.get(elem.shareHoldersList).once(data => {
            holder1 = data.holder1;
            holder2 = data.holder2;
            holder3 = data.holder3;
        })
        let secreKey1, secreKey2, secreKey3, decrypt1, decrypt2, decrypt3;

        await gunInstance.get(myAlias.concat("_").concat(holder1).concat("responseNode")).on(async data1 =>{
            secreKey1 = await SEA.secret(data1.holderEpub, userInstance._.sea);
            decrypt1 = await SEA.decrypt(data1.encryptedShare, secreKey1);

        })
        await gunInstance.get(myAlias.concat("_").concat(holder2).concat("responseNode")).on(async data2 =>{
            secreKey2 = await SEA.secret(data2.holderEpub, userInstance._.sea);
            decrypt2 = await SEA.decrypt(data2.encryptedShare, secreKey2);
        })
        await gunInstance.get(myAlias.concat("_").concat(holder3).concat("responseNode")).on(async data3 =>{
            secreKey3 = await SEA.secret(data3.holderEpub, userInstance._.sea);
            decrypt3 = await SEA.decrypt(data3.encryptedShare, secreKey3);
        })

        console.log(decrypt1.concat(decrypt2).concat(decrypt3));
        let stringJSON = decrypt1.concat(decrypt2).concat(decrypt3);
        let parsedSEA = JSON.parse(stringJSON);

        await gunInstance.get(elem.filename.concat(roomUUIDObj.roomUUIDProperty)).once( async data =>{
            console.log(data);
            let filename = data.filenameProperty;
            let filenameWithNoWhiteSpace = data.filenameWithNoWhiteSpace;
            let CID = data.CID_prop;
            let fileType = data.fileType;

            //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
            let decryptedIVBase64 = await SEA.decrypt(data.iv, parsedSEA);
            const decodedb64Uint8Array  = window.atob(decryptedIVBase64, decryptedIVBase64);
            const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
            const ivUint8Array = new Uint8Array(buffer);
            for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
            }

            //Decrypt the parsedExportedKey using the SEA.pair() of the team room.
            let decryptedKey = await SEA.decrypt(data.fileKey, parsedSEA);
            console.log(decryptedKey);
            //Idk why the fuck this line doesn't work but the decryption process works without it.
            //The value of 'decryptedKey' was supposed to be a JSON string, but it wasn't for some reason.
            //let jsonParseFileKey = await JSON.parse(decryptedJSON);

            await crypto.subtle.importKey("jwk", decryptedKey, { 'name': 'AES-CBC' }, true, ['encrypt', 'decrypt']).then(async cryptoKeyImported =>{
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

                await gunInstance.get(myAlias.concat("_").concat(holder1).concat("responseNode")).put({
                    isAuthorized: null,
                    holderEpub: null,
                    encryptedShare: null
                })
                await gunInstance.get(myAlias.concat("_").concat(holder2).concat("responseNode")).put({
                    isAuthorized: null,
                    holderEpub: null,
                    encryptedShare: null
                })
                await gunInstance.get(myAlias.concat("_").concat(holder3).concat("responseNode")).put({
                    isAuthorized: null,
                    holderEpub: null,
                    encryptedShare: null
                })
            })
        })
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
            <div className="top-toolbar-folder" >
                <div className="top-toolbar-nav-folder">
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/Teams")}><p>Team Rooms</p></button>
                    <button className="btn-navigate-folder" onClick={()=> navigate("/main/Teams/room")}> <p className="btn-room-css">{roomUUIDObj.roomName}</p></button>
                    <button className="btn-navigate-folder btn-selected"><p className="btn-room-css">{folderContext.folderName}</p></button>
                </div>
                <div className={itemSelected.isSelected === true ? "top-toolbar-option-document" : "top-toolbar-option-document-hide"}>
                    <p className="label-item-selected"><b>{itemSelected.fileNameVar} - </b></p>
                    <button className="btn-option-document-css" onClick={()=> handleDownloadSharedFile()}>Download</button>
                    <button className="btn-option-document-css" /* onClick={()=> navigate("/main/Teams/room")} */>Delete</button>
                    <button className="btn-option-document-css" onClick={()=> {setIsVcSidebarViews(!isVcSidebarViews); queryVersion()} }>Check Versions</button>
                    <button className="btn-option-document-css" onClick={()=> setItemSelected({isSelected: false, index: -1})}>Cancel</button>
                    
                </div>
            </div>
            <div className="top-folder-container" >
                <div className="secret-share-docs-container">
                    <h3>Protected Documents:  (Secret Share Security)</h3>
                    <br></br>
                    <table className="table-container">
                        <thead className="table-row-container">
                        <tr>
                            <th>File Name</th>
                            <th>Content Identifier (CID)</th>
                            <th>Date of Upload (Last modified)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                            {filteredSecretSharedDocuments().map((elem, index) =>
                            <tr className="table-row-css">
                            <td>{elem.filename}</td>
                            <td>{elem.cid}</td>
                            <td><p className="date-label-table-css">{elem.date}</p></td>
                            <td><button className="download-btn" onClick={() => HandleRequestShare(elem)}>Request for all shares</button></td>
                            <td><button className="download-btn" onClick={() => downloadSecretShared(elem)}>Download Document</button></td>
                            </tr>
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
                    <p className="vc-sidebar-subtitle">Click on a file to check</p>
                    <table className="table-container-vc">
                        <thead className="table-row-container">
                        <tr>
                            <th>File Name</th>
                            <th>Content Identifier (CID)</th>
                            <th>Date of Upload (Last modified)</th>
                        </tr>
                        </thead>
                        <tbody>
                                                        {filteredVCList.apply().map((elem, index)=>
                                    <tr className="table-row-css" key={index}>
                                        <td>{elem.filenameProperty}</td>
                                        <td>{elem.CID_prop}</td>
                                        <td><p className="date-label-table-css">{elem.date}</p></td>
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

