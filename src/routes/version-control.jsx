import React, { useState, useReducer } from "react";
import { useEffect } from "react";


/* function reducerHandler(currentState, newRoom){
    return { rooms: [...currentState.rooms, newRoom ] }
} */

function VersionControlComponent({gunInstance, userInstance}){

    return (
        <div>
            <h1>Version Control Files</h1>
            <p>For file versioning and audit trail</p>
        </div>
    );
}

export default VersionControlComponent;