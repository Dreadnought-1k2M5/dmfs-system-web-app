import React, { useEffect, useState, useReducer} from "react";
import word from '../../../ms-word.png'

import pdf from '../../../pdf.png'

import file from '../../../file.png'

import { SEA } from "gun";

import './document-collaboration-component.css';

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
   

export default function DocumentCollaborationComponent({gunInstance, userInstance, roomUUIDObj, folderContext, collaborativePanelState, setCollaborativePanelState}){
    let [vcListState, dispatchvcListState] = useReducer(vcUseReducerHandler, currentVCState);

    useEffect(()=>{
        console.log(collaborativePanelState);
        console.log("vc_".concat(collaborativePanelState.documents[0].filename).concat(roomUUIDObj.roomUUIDProperty));
        let filenameBinding = collaborativePanelState.documents[0].filename;
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

    return (
        <div className="document-collab-parent-container">
            <div className="div-box1">
                <img className="icon-size-large-collab" src={ (collaborativePanelState.documents[0].fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (collaborativePanelState.documents[0].fileType === "application/pdf") ? pdf : file } />
                <div className="div-box-1-info">
                    <h3>{collaborativePanelState.documents[0].filename}</h3>

                </div>
            </div>
            <div className="div-box2">
                {filteredVCList().map((elem, index)=>
                    <div key={index}>
                        <div className="item-box-flex-container">
                            <img className="icon-item-collab" src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file } />
                            <h4>{elem.filenameProperty}</h4>
                        </div>

                    </div>
                )}
            </div>
        </div>

    )
}