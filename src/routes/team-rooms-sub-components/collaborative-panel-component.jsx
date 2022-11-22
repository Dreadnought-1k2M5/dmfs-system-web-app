import React, { useEffect, useState, useReducer} from "react";
import { useNavigate } from "react-router-dom";
import word from '../../ms-word.png'

import pdf from '../../pdf.png'

import file from '../../file.png'

import { SEA } from "gun";

import './collaborative-panel-component-css.css';

export default function CollaborativePanelComponent({}){
        //Get the metadata of the selected document
        let [documentSelectedState, setDocumentSelectedState] = useState({});
    
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
{/*                                 {filteredVCList().map((elem, index)=>
                                        <tr className="table-row-css" key={index}>
                                            <td><p className="table-data-label-css">{elem.filenameProperty}</p></td>
                                            <td><p className="cid-label-css">{elem.CID_prop}</p></td>
                                            <td><p className="table-data-label-css">{elem.date}</p></td>
                                            <td><button className="download-btn" onClick={() => handleDownloadSharedFile(elem)}>Download Document</button></td>
                                        </tr>
                                    )} */}
                            </tbody>
                        </table>
            </div>
        </div>

    )
}