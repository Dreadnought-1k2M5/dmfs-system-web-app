import React, { useEffect, useState, useReducer} from "react";
import word from '../../../ms-word.png'

import pdf from '../../../pdf.png'

import file from '../../../file.png'

import { SEA } from "gun";

//import './document-collaboration-component.css';
//import CreateTaskComponent from "../../modal-components/CreateTaskModal";



// useReducer for version control
const currentVCState ={
    vcArray: []
}

const vcUseReducerHandler = (currentVCState, version)=>{
    if(version.reset){
        return {
            vcArray: []
        }
    }
    return {
        vcArray: [version, ...currentVCState.vcArray]
    }
}


// useReducer for taskList
const currentTaskList ={
    taskListArray: []
}

const taskListUseReducerHandler = (currentTaskList, taskList)=>{
    if(taskList.reset){
        return {
            taskListArray: []
        }
    }
    return {
        taskListArray: [taskList, ...currentTaskList.taskListArray]
    }
}
   
   

export default function DocumentCollaborationComponent({gunInstance, userInstance, roomUUIDObj, folderContext, collaborativePanelState, setCollaborativePanelState}){
    let [vcListState, dispatchvcListState] = useReducer(vcUseReducerHandler, currentVCState);
    let [taskListState, dispatchTaskListState] = useReducer(taskListUseReducerHandler, currentTaskList);

    let [changeButtonVCState, setChangeButtonVCState] = useState(false);
    let [selectedVersionState, setSelectedVersionState] = useState(null);
    let [ isModalCreateTaskViewed, setIsCreateTaskModalViewed] = useState(false);

    useEffect(()=>{
        
        //console.log(collaborativePanelState);
        //console.log("vc_".concat(collaborativePanelState.documents[0].filename).concat(roomUUIDObj.roomUUIDProperty));
        let filenameBinding = collaborativePanelState.documents[0].filename;
        gunInstance.get("vc_".concat(filenameBinding).concat(roomUUIDObj.roomUUIDProperty)).map().on((data, index)=>{
/*             console.log(index);
            console.log(data); */
            //console.log(await gunInstance.get("vc_".concat(collaborativePanelState.documents[0].filename).concat(roomUUIDObj.roomUUIDProperty)).get(index));
            dispatchvcListState({
                filenameProperty: data.filenameProperty, 
                filenameWithNoWhiteSpace: data.filenameWithNoWhiteSpace, 
                CID_prop: data.CID_prop, 
                fileKey: data.fileKey, 
                iv: data.iv, 
                fileType: data.fileType,
                date: data.date,
                uploadedBy: data.uploadedBy,
                index: index
            })
        })
        if(selectedVersionState != null){
            console.log(selectedVersionState);
            gunInstance.get(`taskList_${selectedVersionState.filenameProperty}${roomUUIDObj.roomUUIDProperty}_${selectedVersionState.index}}`).on(data =>{
                dispatchTaskListState({
                    content: data.content,
                    date: data.date,
                    user: data.user
                })
            })
        }


    }, [])

    function showCreateTaskModal(){
        setIsCreateTaskModalViewed(true);
    }
    function hideCreateRoomModal(){
        setIsCreateTaskModalViewed(false);
    }

    const filteredVCList = () =>{
        console.log("filtered VC function called")
        const filteredVC = vcListState.vcArray.filter((value, index) => {
            
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


    const filteredTaskList = () =>{
        console.log("filtered task function called")
        const filteredVC = taskListState.taskListArray.filter((value, index) => {
            
            const _value = JSON.stringify(value);
            return (
                index ===
                taskListState.taskListArray.findIndex(obj => {
                return JSON.stringify(obj) === _value
                })
            )
        })
        return filteredVC;
    }

    return (

        <div className="document-collab-parent-container">
            <CreateTaskComponent versionState={selectedVersionState == null ? collaborativePanelState.documents[0] : selectedVersionState} roomUUIDObj={roomUUIDObj} gunInstance={gunInstance} userInstance={userInstance} handleClose={hideCreateRoomModal} show={isModalCreateTaskViewed} />


            <div className={changeButtonVCState ? "div-vc-box" : "div-vc-box-none"}>
                {filteredVCList().map((elem, index)=>
                    <div className="item-box-flex-container" key={index} onClick={(e)=>{
                        dispatchTaskListState({reset: true});
                        setSelectedVersionState(elem);
                        setChangeButtonVCState(false);
                        gunInstance.get(`taskList_${elem.filenameProperty}${roomUUIDObj.roomUUIDProperty}_${elem.index}}`).on(data =>{
                            dispatchTaskListState({
                                content: data.content,
                                date: data.date,
                                user: data.user
                            })
                        })
                        }
                    }>
                        <img className="icon-item-collab" src={ (elem.fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (elem.fileType === "application/pdf") ? pdf : file } />
                        <p>{elem.filenameProperty}</p>
                    </div>
                )}
            </div>

            <div className="div-box1">
                <div className="div-box1-flex-item1">
                    <div className="flex-item1-container1">
                        <img className="icon-size-large-collab" src={ (collaborativePanelState.documents[0].fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") ? word : (collaborativePanelState.documents[0].fileType === "application/pdf") ? pdf : file } />
                        {
                            selectedVersionState != null ? 
                            <div className="div-box-1-info">
                                <h3>{selectedVersionState.filenameProperty} - Selected</h3>
                                <p>Version uploaded by: </p>
                             </div>


                                : 
                            <div className="div-box-1-info">
                                <h3>{collaborativePanelState.documents[0].filename} - Latest version</h3>
                                <p>Version uploaded by: </p>
                            </div>

                        }

                    </div>
                    <div className="flex-item1-container2">
                        <button onClick={(e) => {

                            if(changeButtonVCState == false){
                                setChangeButtonVCState(true);
                            } else{
                                setChangeButtonVCState(false);
                            }
                        } }>Check Versions</button>
                    </div>
                    <div className="flex-item1-container2">
                        <button onClick={()=> setIsCreateTaskModalViewed(true)}>Create New Task</button>
                    </div>
                </div>

            </div>

            <div className="div-box2">
                <ul className="div-box2-ul-box">
                    {filteredTaskList().map((elem, index)=>
                        <li className="div-box2-li-box" key={index}>
                            {console.log(elem)}
                            <div className="btn-box">
                                <button className="button-css">Close Task</button>
                            </div>
                            <div className="p-title-desc">
                                <h4>{elem.content}</h4>
                                <p>Created on {elem.date} by {elem.user}</p>
                            </div>
                        </li>
                    )}
                </ul>
            </div>
        </div>

    )
}
