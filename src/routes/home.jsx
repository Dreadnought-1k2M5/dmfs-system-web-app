import React, { useState, useEffect, useReducer } from "react";

import UploadFile from "./UploadFile";

import "./routes-css/home.css"

const initialState = {
  listFiles: []
}

function reducer(state, item){
  return {
    listFiles: [item, ...state.listFiles]
  }
}

function Home({userInstance}) {
  let [email, setEmail] = useState('');
  let [fileListState, setFileListState] = useState([]);
  let [isModalViewed, setIsModalViewed] = useState(false);

  function showModal(){
    setIsModalViewed(true);
  }
  function hideModal(){
    setIsModalViewed(false);
  }

  useEffect(()=>{
    userInstance.get('userProfile').once((data)=>setEmail(data.emailProp));
  }, []);

  useEffect(()=>{
    userInstance.get('fileObjectList').map().once((key)=>{
      console.log(key);
      setFileListState(oldList => [...oldList, {filename: key.filenameProperty, cid: key.CID_prop}]);
    });

  },[])

/*   async function DownloadHandle(cid){
    let cid_temp = cid;
    let localFilename;

    await userInstance.get('fileObjectList').get(`${cid}`).on(data => {
      localFilename = data.filenameProperty;
    });

    fetch(`https://${cid_temp}.ipfs.w3s.link/ipfs/${cid_temp}/${localFilename}`).then(res => {
      let result = res.blob();
      console.log(result);
      return result;
    }).then(res => {
      const aElement = document.createElement('a');
      aElement.setAttribute('download', `${localFilename}`);
      const href = URL.createObjectURL(res);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
    })
  } */
  return (
    <div className="home-parent-container">
      <div className="top-toolbar">
        <button className="toolbar-btn" onClick={showModal}>Upload</button>
        <UploadFile userInstance={userInstance} handleClose={hideModal} show={isModalViewed}/>
      </div>
      <div className="home-container">
            <br></br>
            <h3>
              My Documents:
            </h3>
            <p>NOTE: Metadata of each file is transmitted across GUN peers, so you may see duplicates of the same file listed below.</p>
            <br></br>
              <table className="table-container">
                <thead className="table-row-container">
                  <tr>
                    <th>Name</th>
                    <th>Content Identifier (CID)</th>
                  </tr>
                </thead>
                <tbody>
                 {/*  {setDuplicatesRemoved(...new Set(fileListState))} */}
                    {fileListState.map(elem =>
                    <tr>
                      <td>{elem.filename}</td>
                      <td>{elem.cid}</td>
                      <td><button className="download-btn" onClick={async ()=>{
                        let cid_temp = elem.cid;
                        let localFilename = elem.filename;
                    
                        fetch(`https://${cid_temp}.ipfs.w3s.link/ipfs/${cid_temp}/${localFilename}`).then(res => {
                          let result = res.blob();
                          console.log(result);
                          return result;
                        }).then(res => {
                          const aElement = document.createElement('a');
                          aElement.setAttribute('download', `${localFilename}`);
                          const href = URL.createObjectURL(res);
                          aElement.href = href;
                          aElement.setAttribute('target', '_blank');
                          aElement.click();
                          URL.revokeObjectURL(href);
                        })
                      }}>Download File</button></td>
                    </tr>
                  )}
                </tbody>
              </table>
              
      </div>
    </div>
    
  );
}

export default Home;
