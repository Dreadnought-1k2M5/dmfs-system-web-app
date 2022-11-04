import React, { useEffect, useState, useReducer } from "react";

import "./modal-css/request-share-modal.css";

export default function RequestShareModalComponent({secretSharedDocumentObj, uuidRoomObj, gunInstance, userInstance, handleClose, show}){
    
    //State for holding the secretSharedDocumentObj
    let [secretSharedDocumentState, setSecretSharedDocumentState] = useState({});
    let [holderListState, setHolderListState] = useState({});
    useEffect(()=>{
        if(show){
            setSecretSharedDocumentState(secretSharedDocumentObj);
        }

    }, [show])

    async function sendRequestHandler(){
        await userInstance.get('alias').on(async myAlias =>{
            await gunInstance.get(`${secretSharedDocumentObj.filename}_requestItem`).put({requestor: myAlias, filename: secretSharedDocumentObj.filename})

            let requestItemRef = gunInstance.get(`${secretSharedDocumentObj.filename}_requestItem`);
            await gunInstance.get(`${secretSharedDocumentState.holder1}_requestSetNode`).set(requestItemRef);

            await gunInstance.get(`${secretSharedDocumentState.holder2}_requestSetNode`).set(requestItemRef);

            await gunInstance.get(`${secretSharedDocumentState.holder3}_requestSetNode`).set(requestItemRef);

        })
    }
    const toggleClassname = show ? "modal-request-share-group modal-request-share-container" : "modal-request-share-group display-none";  
    return (
        <div className={toggleClassname}>
            <div className="request-share-modal-box">
                <div className="exit-box">
                    <button onClick={handleClose}>X</button>
                </div>
                <div className="request-share-modal-content-box">
                    <div className="title-box-request-share-modal">
                        <h2>Requesting Share to all share holders </h2>
                    </div>
                    <div className="request-share-box1">
                        <p>Document Name: <b>{secretSharedDocumentState.filename}</b></p>
                        <ul className="list-shareholders-box">
                            <li>{secretSharedDocumentState.holder1}</li>
                            <li>{secretSharedDocumentState.holder2}</li>
                            <li>{secretSharedDocumentState.holder3}</li>
                        </ul>
                    </div>
                </div>
                <div>
                    <button onClick={sendRequestHandler}>Send Request</button>
                    <h3>The document should download automatically after all share holders grant you permission to access the document</h3>
                </div>
            </div>
        </div>    
    )
}