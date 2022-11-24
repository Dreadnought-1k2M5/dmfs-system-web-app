import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../../ms-word.png'

import pdf from '../../../pdf.png'

import file from '../../../file.png'

import { SEA } from "gun";

import './shared-documents.css'
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

export default function SharedDocumentComponent({gunInstance, userInstance, roomUUIDObj, folderContext, setFilePanelState, setFolderNameState, itemSelected, setItemSelected, setDocumentSelectedState}){
    //useReducer for documents/files (shared)
    let [documentListState, documentsDispatch] = useReducer(documentsUseReducerHandler, currentDocumentListState);

    const filteredSharedDocumentsList = () =>{
        //console.log("filtered shared documents function called")
        const filteredDocumentList = documentListState.documents.filter((value, index) => {
            //console.log(value);
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

    function handleItemSelected(elem, index, fileNameVar){
        console.log(elem);
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

    useEffect(()=>{
        documentsDispatch({reset: true});
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
            if(data.accessType === "shared"){
                documentsDispatch({
                    filename: getFileName, 
                    fileType: getFileType, 
                    accessType: getAccessType, 
                    cid: CID, 
                    date: date
                })
            }
        })

    }, [])
    return (
        <div className="shared-docs-container">
                <div className="folder-list-flex-container">
                {filteredSharedDocumentsList().map((elem, index)=>
                    <div className={itemSelected.isSelected && itemSelected.index === index ? "item-selected" : "document-item"} key={index} onClick={ () => handleItemSelected(elem, index) }>
                        <img  className='icon-document' src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file }/>
                
                        <p>{elem.filename}</p>
                    </div>
                )}
                </div>
        </div>
    )
}