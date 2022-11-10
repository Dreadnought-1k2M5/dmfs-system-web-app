import React, { useEffect, useState, useReducer } from "react";

import "./modal-css/request-share-modal.css";

import { SEA } from "gun";
import Axios from "axios";
//useReducer for the RequestShareModal
const currentResponseListState = {
    responses: []
}

const responseListStateUseReducer = (currentResponseListState, response)=>{
    if(response.reset){
        return {
            responses: []
        }
    }
    return {
        responses: [...currentResponseListState.responses, response]
    }
}


export default function RequestShareModalComponent({seaPairRoomProp, secretSharedDocumentObj, roomUUIDObj, gunInstance, userInstance, handleClose, show}){
    
    //State for holding the secretSharedDocumentObj
    let [secretSharedDocumentState, setSecretSharedDocumentState] = useState({});

    //useReducer for response
    let [responseListState, dispatchResponse] = useReducer(responseListStateUseReducer, currentResponseListState);

    //useState for holding all 3 decrypted shares in order
    let [listShareState, setListShareState] = useState([]);

    useEffect(()=>{
        if(show){
            setSecretSharedDocumentState(secretSharedDocumentObj);
        }
        console.log("Use effect called");
        dispatchResponse({reset: true});
        userInstance.get('alias').on(async myAlias =>{
            console.log(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`);

            userInstance.get("my_team_rooms").map().on(async data0 => {
                if(data0.nameOfRoom == roomUUIDObj.roomName){
                    //console.log(seaRoomState);
                    gunInstance.get(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`).map().once(async (data1, index) =>{
                        console.log(data1);
                        console.log(index);
                        if(data1.grantor != null && data1.encryptedShare != null){
                            //Reconstrucct the key and decrypt
                            let parsedRoomSEA = JSON.parse(data0.roomSEA);
                            let decryptedShare = await SEA.decrypt(data1.encryptedShare, await SEA.secret(parsedRoomSEA.epub, userInstance._.sea));
                            console.log(decryptedShare);
                            dispatchResponse({decryptedShare: decryptedShare, holderAlias: data1.grantor});
                        }
                    })
                }
            })

        })

    
    }, [])

    const filteredResponse = () => {
        console.log("filteredResponse function called");
        console.log(responseListState.responses);
        const formattedResponses = responseListState.responses.filter((value, index) => {

            const _value = JSON.stringify(value)
            return (
                index ===
                responseListState.responses.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return formattedResponses;
    }


    async function GenerateRequestNode(filename, holder, alias, encShare, dateJSON){
        await gunInstance.get(`${filename}_${holder}_requestItem_${dateJSON}`).put({
            requestor: alias, 
            filename: filename,
            requestorEpub: userInstance._.sea.epub,
            encShare: encShare,
            date: dateJSON
        });
    }

    async function sendRequestHandler(){

    
         await userInstance.get('alias').once(async myAlias =>{
            let dateJSON = new Date().toJSON();

            GenerateRequestNode(secretSharedDocumentObj.filename, secretSharedDocumentObj.holder1Alias, myAlias, secretSharedDocumentObj.encShare1, dateJSON);
            //Individual node representing a request node

            let requestItemRef1 = await gunInstance.get(`${secretSharedDocumentObj.filename}_${secretSharedDocumentObj.holder1Alias}_requestItem_${dateJSON}`);
            
            GenerateRequestNode(secretSharedDocumentObj.filename, secretSharedDocumentObj.holder2Alias, myAlias, secretSharedDocumentObj.encShare2, dateJSON);
            //Individual node representing a request node

            let requestItemRef2 = await gunInstance.get(`${secretSharedDocumentObj.filename}_${secretSharedDocumentObj.holder2Alias}_requestItem_${dateJSON}`);

            //Individual node representing a request node
            GenerateRequestNode(secretSharedDocumentObj.filename, secretSharedDocumentObj.holder3Alias, myAlias, secretSharedDocumentObj.encShare3, dateJSON);

            let requestItemRef3 = await gunInstance.get(`${secretSharedDocumentObj.filename}_${secretSharedDocumentObj.holder3Alias}_requestItem_${dateJSON}`);

            //The next 3 lines refer to the individual nodes where share holder users subscribe to read any live request.
            await gunInstance.get(`${secretSharedDocumentState.holder1Alias}_requestSetNode`).set(requestItemRef1);
            await gunInstance.get(`${secretSharedDocumentState.holder2Alias}_requestSetNode`).set(requestItemRef2);
            await gunInstance.get(`${secretSharedDocumentState.holder3Alias}_requestSetNode`).set(requestItemRef3);
        })
    }

    async function accessHandler(event, shareListArg){
        event.preventDefault();
        //let decryptedShare = await SEA.decrypt(encShareArg, await SEA.secret())
/*         let listOfResponseItemIndex = [];
        await userInstance.get('alias').once(async myAlias =>{
            gunInstance.get(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`).map().once(async (data, index) =>{
                console.log(index);
                console.log(data);
                //listOfResponseItemIndex.push(index);
                gunInstance.get(index).put({
                    grantor: null,
                    encryptedShare: null,
                    date: null,
                })
            })

        })

        return; */
        Axios.post('https://floating-fjord-99601.herokuapp.com/reconstruct', {
            shareListProperty: shareListArg
        }).then(async response =>{
            
            alert(response.data.ResponseMessage);

            //query individual component
            await gunInstance.get(`${secretSharedDocumentState.filename}${roomUUIDObj.roomUUIDProperty}`).once(async data =>{
                let filename = data.filenameProperty;
                let filenameWithNoWhiteSpace = data.filenameWithNoWhiteSpace;
                let CID = data.CID_prop;
                let fileType = data.fileType;
                console.log(seaPairRoomProp);
                console.log(typeof seaPairRoomProp);
                console.log(JSON.parse(seaPairRoomProp));
                console.log(typeof JSON.parse(seaPairRoomProp));
                
                //Initialization Vector: Decrypt and Decode base64-encoded string back into Uint8Array type using the SEA.pair() of the team room
                let decryptedIVBase64 = await SEA.decrypt(data.iv, JSON.parse(seaPairRoomProp));
                console.log(decryptedIVBase64);
                const decodedb64Uint8Array  = window.atob(decryptedIVBase64); //Decode base64-encoded string back into Uint8Array
                console.log(decodedb64Uint8Array);
                const buffer = new ArrayBuffer(decodedb64Uint8Array.length); 
                console.log(buffer);

                const ivUint8Array = new Uint8Array(buffer);
                for (let i = 0; i < decodedb64Uint8Array.length; i++) {
                    ivUint8Array[i] = decodedb64Uint8Array.charCodeAt(i)
                }
                console.log(ivUint8Array);
                console.log(response.data.exportedKey);
                console.log(typeof response.data.exportedKey);
                let decryptedKey = JSON.parse(response.data.exportedKey);
                console.log(decryptedKey);

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

                            //Delete Response from holders
                            let listOfResponseItemIndex = [];
                            userInstance.get('alias').once(async myAlias =>{
                                gunInstance.get(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`).map().once(async (data, index) =>{
                                    console.log(index);
                                    console.log(data);
                                    //listOfResponseItemIndex.push(index);
                                    gunInstance.get(index).put({
                                        grantor: null,
                                        encryptedShare: null,
                                        date: null,
                                    })
                                })

                            })
                            setTimeout(()=> { window.location.reload(); }, 6200);

                        }).catch(console.error);
                    });

                })
            })
        })

    }



    const toggleClassname = show ? "modal-request-share-group modal-request-share-container" : "modal-request-share-group display-none";  
    return (
        <div className={toggleClassname}>
            <div className="request-share-modal-box">
                <div className="exit-box">
                    <button onClick={(e) => {e.preventDefault(); handleClose()} }>X</button>
                </div>
                <div className="request-share-modal-content-box">
                    <div className="title-box-request-share-modal">
                        <h2>Requesting Share to all share holders </h2>
                        <button onClick={(e) => {e.preventDefault(); sendRequestHandler() }}>Send Request</button>

                    </div>
                    <div className="request-share-box1">
                        <p>Document Name: <b>{secretSharedDocumentState.filename}</b></p>
                        <br></br>
                        <p>Listening for live response: </p>
                        <ul className="list-shareholders-box">
                                {
                                filteredResponse().map((response, index)=>
                                <span>
                                    <li key={index} className="list-item-holder">
                                        <b>{response.holderAlias}</b> has granted you permission
                                        {console.log(response.decryptedShare)}
                                        {console.log(filteredResponse().length)}
                                    </li>
                                </span>
                                )
                            }
                        </ul>
                    </div>
                </div>
                <div>
                    {filteredResponse().length === 3 && 
                        <div>
                            <button onClick={(e) => accessHandler(e, filteredResponse())}>Reconstruct Symmetric Key and Download Document</button>
                        </div>
                    }
                    
                    <button onClick={(e) => accessHandler(e, filteredResponse())}>CLEAR ALL</button>

                </div>
            </div>
        </div>    
    )
}