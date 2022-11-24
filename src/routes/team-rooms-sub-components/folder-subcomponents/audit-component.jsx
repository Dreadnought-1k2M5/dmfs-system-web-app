

import React, { useEffect, useState, useReducer} from "react";
import './audit-component.css';
import './secret-shared-component.css';

// useReducer for secret shared documents
const currentAuditListState = {
    auditArrayState: []
}

const documentsSecretSharedUseReducerHandler = (auditListState, auditArg)=>{
    if(auditArg.reset){
        return {
            auditArrayState: []
        }
    }
    return {
        auditArrayState: [auditArg, ...auditListState.auditArrayState]
    }
}

export default function AuditComponent({gunInstance, userInstance, roomUUIDObj, folderContext, setFilePanelState, setFolderNameState, itemSelected, setItemSelected}){
    //useReducer for documents/files (secret shared)
    let [auditDataListState, auditDataDispatch] = useReducer(documentsSecretSharedUseReducerHandler, currentAuditListState);


    useEffect(()=>{
        console.log(folderContext)
        gunInstance.get(`log_${folderContext.folderNameClean}_${roomUUIDObj.roomUUIDProperty}`).map().on(async data =>{
            //get the property name of the unique node containing the individual file's metadata
            //let getFileNameRoomUUIDProperty = data.filenameProperty.concat(roomUUIDObj.roomUUIDProperty);
            console.log(data);
            console.log({ 
                dateOccured: data.dateOccured,
                content: data.content,
                user: data.user,
                sampleProp: data.sampleProp
            })
            auditDataDispatch({
                dateOccured: data.dateOccured,
                content: data.content,
                user: data.user
            })
        })
    }, [])

    
    // Remove duplicated documents from the "documents" property in the documentListState and get only objects with access type of "secretShare".
    function filteredAuditLogs(){
        //console.log("filtered SECRET shared documents function called")
        const filteredDocumentList = auditDataListState.auditArrayState.filter((value, index) => {
            console.log("YYYYYYYYYYYYYYYYYYYYYYYYYYYYYY");
            console.log(value);
            const _value = JSON.stringify(value);
            return (
                index ===
                auditDataListState.auditArrayState.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })

        return filteredDocumentList;
    }

    
    return (
        <div className="audit-container">
                    <table className="audit-table-container">
                        <thead className="audit-table-row-container">
                            <tr>
                                
                                <th><p className="table-header-label-css">Date of Event Occured</p></th>
                                <th><p className="table-header-label-css">Event Description</p></th>
                                <th><p className="table-header-label-css">User</p></th>

                            </tr>
                        
                        </thead>
                        <tbody>
                            {filteredAuditLogs().map((elem, index) =>
                                <tr className="table-row-css" key={index}>
                                    <td><p className="audit-table-header-label-css">{elem.dateOccured}</p></td>
                                    <td><p className="audit-table-header-label-css">{elem.content}</p></td>
                                    <td><p className="audit-table-header-label-css">{elem.user}</p></td>
                                </tr>
                                )
                            }
                        </tbody>
                    </table>
        </div> 
    )
}