import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'

import { SEA } from "gun";

import './file-panel-component-css.css';

import VersionControlComponent from "./file-panel-subcomponents/version-control-component";

//import DocumentCollaborationComponent from "./collaborative-panel-subcomponents/document-collaboration-component";



export default function FilePanelComponent({gunInstance, userInstance, roomUUIDObj, folderContext, filePanelState, setFilePanelState}){

        let [nav1, setNav1] = useState(true);
/*         let [nav2, setNav2] = useState(false);
 */

        useEffect(()=>{
           

        }, [])



        function SwitchTabs(e, optionStr){
            e.preventDefault(); 

            switch(optionStr){
                case "btn1":
                    setNav1(true);
                    //setNav2(false);
                    break;
/*                 case "btn2":
                    setNav1(false);
                    setNav2(true);
                    break; */ 
            }
        }   

    return (
        <div>
            <div className="title-component-collab-panel">
                <h2>File Panel</h2>
                <div className="navbar-box-collab">
                    
                    <button className={ nav1 ? "btn-nav-collab-active" : "btn-nav-collab" } onClick={(e) =>{ SwitchTabs(e, "btn1") } }>Version Control</button>

                </div>
            </div>
{/*             {nav1 && <DocumentCollaborationComponent 
                gunInstance={gunInstance} 
                userInstance={userInstance} 
                roomUUIDObj={roomUUIDObj} 
                folderContext={folderContext}
                collaborativePanelState={collaborativePanelState} 
                setCollaborativePanelState={setCollaborativePanelState}
            />} */}
            {nav1 && <VersionControlComponent 
                gunInstance={gunInstance} 
                userInstance={userInstance} 
                roomUUIDObj={roomUUIDObj} 
                folderContext={folderContext}
                filePanelState={filePanelState} 
                setFilePanelState={setFilePanelState}
            />}
            
        </div>

    )
}