import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";

import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'

import './folder-component.css';

const currentDocumentListState ={
    documents: []
}

const documentsUseReducerHandler = (documentListState, document)=>{
    return {
        documents: [document, ...documentListState.documents]
    }
}

export default function FolderComponent({gunInstance, userInstance, roomUUIDObj, folderContext}){
    let [documentListState, documentsDispatch] = useReducer(documentsUseReducerHandler, currentDocumentListState)
    let navigate = useNavigate();

    useEffect(()=>{
        gunInstance.get(folderContext.folderName.concat(roomUUIDObj.roomUUIDProperty)).map().once(data =>{
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
            console.log(value);
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

    function navigateTeamRoom(event){

        switch(event.target.value){
            case "Team Rooms":
                navigate("/main/Teams");
                break;
            case roomUUIDObj.roomName:
                navigate("/main/Teams/room");
                break;
        }
    }
    return (
        <div>
            <div className="top-toolbar-folder">
                <div className="top-toolbar-nav-folder">
                    <input type="button" className="btn-navigate-folder" value="Team Rooms" onClick={(e) => navigateTeamRoom(e)} />
                    <input type="button" className="btn-navigate-folder" value={roomUUIDObj.roomName} onClick={(e) => navigateTeamRoom(e)} />
                    <input type="button" className="btn-navigate-folder" value={folderContext.folderName} />

                </div>                
            </div>
            <h1>{folderContext.folderName}</h1>
            <br></br>
            <div className="folder-list-flex-container">
                {console.log(filteredDocumentsList())}
                {filteredDocumentsList().map((elem, index)=>
                    <div className="document-item" key={index}>
                        <img src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file } className='icon-document'/>
                        <p>{elem.filename}</p>
                    </div>
                )}
            </div>

        </div>
    )
}