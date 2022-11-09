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

            userInstance.get("my_team_rooms").map().on(async data => {
                if(data.nameOfRoom == roomUUIDObj.roomName){
                    let seaPairRoomPropParsed = JSON.parse(data.roomSEA);
                    //console.log(seaRoomState);
                    gunInstance.get(`responseNodeSet_${myAlias}_${roomUUIDObj.roomUUIDProperty}`).map().once(async (data, index) =>{
                        console.log(data);
                        console.log(index);
                        if(data.grantor != null && data.encryptedShare != null){
                            //Reconstrucct the key and decrypt
                            let decryptedShare = await SEA.decrypt(data.encryptedShare, await SEA.secret(seaPairRoomPropParsed.epub, userInstance._.sea));
                            console.log(decryptedShare);
                            dispatchResponse({decryptedShare: decryptedShare, holderAlias: data.grantor});
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
        let seaPairRoomPropParsed = JSON.parse(seaPairRoomProp);
        console.log(seaPairRoomPropParsed);
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

        Axios.post('http://localhost:3200/reconstruct', {
            shareListProperty: shareListArg
        }).then(response =>{
            alert(response.data.ResponseMessage);

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
                //Set all property values of each individual node to null
/*                 listOfResponseItemIndex.forEach((data, index)=>{
                    gunInstance.get(data).put({
                        grantor: null,
                        encryptedShare: null,
                        date: null,
                    })
                }) */

            })
            setTimeout(()=> { window.location.reload(); }, 3000);
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
                <button onClick={(e) => accessHandler(e, filteredResponse())}>CLEAR ALL</button>

                    {filteredResponse().length === 3 && 
                        <div>
                            <button onClick={(e) => accessHandler(e, filteredResponse())}>Reconstruct Symmetric Key and Download Document</button>
                        </div>
                    }
                    
                </div>
            </div>
        </div>    
    )
}