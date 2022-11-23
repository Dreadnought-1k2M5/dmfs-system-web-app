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

export default function VersionControlComponent({gunInstance, userInstance, roomUUIDObj, folderContext, collaborativePanelState, setCollaborativePanelState}){
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
        <div>
            <div className="vc-container">
                        <h3>Version Control</h3>
                        <p className="vc-sidebar-subtitle">Click on a file to check all of its different versions</p>
                        <br></br>
                        <table className="table-container-vc">
                            <thead className="table-row-container">
                            <tr>
                                <th><p className="table-header-label-css">Document Name</p></th>
                                <th><p className="table-header-label-css">Content Identifier (CID)</p></th>
                                <th><p className="table-header-label-css">Date of Upload (Last modified)</p></th>
                            </tr>
                            </thead>
                            <tbody>
                                {filteredVCList().map((elem, index)=>
                                        <tr className="table-row-css" key={index}>
                                            {console.log(elem)}
                                            <td><p className="table-data-label-css">{elem.filenameProperty}</p></td>
                                            <td><p className="cid-label-css">{elem.CID_prop}</p></td>
                                            <td><p className="table-data-label-css">{elem.date}</p></td>
                                            <td><button className="download-btn" onClick={(e) => e.preventDefault() /* handleDownloadSharedFile(elem) */}>Download Document</button></td>
                                        </tr>
                                )}
                            </tbody>
                        </table>
            </div>
        </div>

    )
}