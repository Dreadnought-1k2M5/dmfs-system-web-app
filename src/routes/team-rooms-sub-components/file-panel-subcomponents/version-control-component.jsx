import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../../ms-word.png'

import pdf from '../../../pdf.png'

import file from '../../../file.png'

import { SEA } from "gun";

import './version-control-component.css';

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

export default function VersionControlComponent({gunInstance, userInstance, roomUUIDObj, folderContext, filePanelState, setFilePanelState}){
        let [vcListState, dispatchvcListState] = useReducer(vcUseReducerHandler, currentVCState);

        //Get the metadata of the selected document
        let [documentSelectedState, setDocumentSelectedState] = useState({});
        let [SEAState, setSEA] = useState('');

        useEffect(()=>{
            userInstance.get("my_team_rooms").map().on(data=>{
                delete data._;
                console.log(data);
                if(data.uuidOfRoom === roomUUIDObj.roomUUIDProperty){
                    console.log(data.roomSEA);
                    setSEA(data.roomSEA);
                }
            })
            console.log("vc_".concat(filePanelState.documents[0].filename).concat(roomUUIDObj.roomUUIDProperty));
            let filenameBinding = filePanelState.documents[0].filename;
            gunInstance.get("vc_".concat(filenameBinding).concat(roomUUIDObj.roomUUIDProperty)).map().once(async data=>{
                console.log(data);
                dispatchvcListState({
                    filenameProperty: data.filenameProperty, 
                    filenameWithNoWhiteSpace: data.filenameWithNoWhiteSpace, 
                    CID_prop: data.CID_prop, 
                    fileKey: data.fileKey, 
                    iv: data.iv, 
                    fileType: data.fileType,
                    date: data.date,
                    dateUploaded: data.dateUploaded,
                    uploadedBy: data.uploadedBy
                })
            })
            //queryVersionHandler();

        }, [])


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

        async function handleDownloadSharedFile(elem){
            alert("Downloading file\nPlease wait for a few moments.\nYour document will download automatically");
            console.log(elem);
            let filename = elem.filenameProperty;
            let filenameWithNoWhiteSpace = elem.filenameWithNoWhiteSpace;
            let CID = elem.CID_prop;
            let fileType = elem.fileType;
            
            //Get the SEA pair of the team room
            //SEAState value is in JSON format, parse it.
            let parsedSEAState = JSON.parse(SEAState);

            //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
            let decryptedIVBase64 = await SEA.decrypt(elem.iv, parsedSEAState);
            const decodedb64Uint8Array  = window.atob(decryptedIVBase64); //Decode base64-encoded string back into Uint8Array
            const buffer = new ArrayBuffer(decodedb64Uint8Array.length);
            const ivUint8Array = new Uint8Array(buffer);
            for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
            }


            //Decrypt the parsedExportedKey using the SEA.pair() of the team room.
            let decryptedKey = await SEA.decrypt(elem.fileKey, parsedSEAState);
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
            return;

    
        }

    return (
        <div>
            <div className="vc-container">

                        <table className="table-container-vc">
                            <thead className="table-row-container">
                            <tr>
                                <th><p className="table-header-label-css">Document Name</p></th>
                                <th><p className="table-header-label-css">Content Identifier (CID)</p></th>
                                <th><p className="table-header-label-css">Date Created / Last modified</p></th>
                                <th><p className="table-header-label-css">Date Uploaded</p></th>
                                <th><p className="table-header-label-css">Uploaded By</p></th>
                                
                            </tr>
                            </thead>
                            <tbody>
                                {filteredVCList().map((elem, index)=>
                                        <tr className="table-row-css" key={index}>
                                            {console.log(elem)}
                                            <td><p className="table-data-label-css">{elem.filenameProperty}</p></td>
                                            <td><p className="cid-label-css">{elem.CID_prop}</p></td>
                                            <td><p className="table-data-label-css">{elem.date}</p></td>
                                            <td><p className="table-data-label-css">{elem.dateUploaded}</p></td>
                                            <td><p className="table-data-label-css">{elem.uploadedBy}</p></td>

                                            <td><button className="download-btn" onClick={(e) => { e.preventDefault(); handleDownloadSharedFile(elem)} }><h3>Download Document</h3></button></td>
                                        </tr>
                                )}
                            </tbody>
                        </table>
            </div>
        </div>

    )
}