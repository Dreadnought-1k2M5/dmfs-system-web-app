import React, { useEffect, useState, useReducer} from "react";
import RequestShareModalComponent from "../../modal-components/RequestShareModal";

import './secret-shared-component.css';

// useReducer for secret shared documents
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

export default function SecretSHaredComponent({gunInstance, userInstance, roomUUIDObj, folderContext, setFilePanelState, setFolderNameState, itemSelected, setItemSelected}){
    let [SEAState, setSEA] = useState('');

    //useReducer for documents/files (secret shared)
    let [documentListStateSecretSharedState, documentsSecretSharedDispatch] = useReducer(documentsSecretSharedUseReducerHandler, currentDocumentSecretSharedListState);

    //State to hold the secret shared document metadata object to be passed on the RequestShareModal component
    let [holdSecretSharedObject, setHoldSecretSharedObject] = useState();


    useEffect(()=>{
        userInstance.get("my_team_rooms").map().on(data=>{
            delete data._;
            console.log(data);
            if(data.uuidOfRoom === roomUUIDObj.roomUUIDProperty){
                console.log(data.roomSEA);
                setSEA(data.roomSEA);
            }
        })
        gunInstance.get(folderContext.folderNameNodeFull).map().on(data =>{
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
        })
    }, [])

    //State to toggle the request share modal component
    let [isRequestShareModalViewed, setIsRequestShareModalViewed] = useState(false);
    async function showShareRequestModal(elem){
        setIsRequestShareModalViewed(true);
        setHoldSecretSharedObject(elem);

    }
    function hideShareRequestModal(){
        setIsRequestShareModalViewed(false);
    }
    
    // Remove duplicated documents from the "documents" property in the documentListState and get only objects with access type of "secretShare".
    const filteredSecretSharedDocuments = () =>{
        //console.log("filtered SECRET shared documents function called")
        const filteredDocumentList = documentListStateSecretSharedState.documentsSecretSharedArrayState.filter((value, index) => {
            //console.log(value);
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

    

    return (
        <div className="secret-share-docs-container">
                    {isRequestShareModalViewed && <RequestShareModalComponent folderContext={folderContext} seaPairRoomProp={SEAState} secretSharedDocumentObj={holdSecretSharedObject} roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideShareRequestModal} show={isRequestShareModalViewed}/> }
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
                            {filteredSecretSharedDocuments().map((elem, index) =>
                            <tr className="table-row-css">
                            <td><p className="table-data-label-css">{elem.filename}</p></td>
                            <td><p className="table-data-label-css cid-label-css">{elem.cid}</p></td>
                            <td><p className="table-data-label-css">{elem.date}</p></td>
                            <td><button className="download-btn" onClick={() => showShareRequestModal(elem)}>Request for all shares</button></td>
                           </tr>
                        )}
                        </tbody>
                    </table>
        </div> 
    )
}