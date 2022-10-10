import React, { useState } from "react";
import { useEffect } from "react";

import "./routes-css/home.css"

function Home({userInstance}) {
  let [email, setEmail] = useState('');
  let [fileList, setFileList] = useState([]);
  useEffect(()=>{
    userInstance.get('userProfile').on((data)=>setEmail(data.emailProp));
    userInstance.get('fileNamesObject').map().once((key)=>{
      console.log(`${key}`);
      userInstance.get('fileObjectList').get(`${key}`).once(dataObj => setFileList(oldList => [...oldList, {filename: dataObj.filenameProperty, cid: dataObj.CID_prop}]));
    });

/*     userInstance.get('document0.docx').on(dataObj=>{
      console.log(dataObj.CID_prop);
    }); */
  }, []);

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
    <div className="home-container">
      <h1>Home:</h1>
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
              {fileList.map(elem =>
              <tr>
                <td>{elem.filename}</td>
                <td>{elem.cid}</td>
                <td><button className="download-btn" onClick={async ()=>{
                  let cid_temp = elem.cid;
                  let localFilename;
              
                  await userInstance.get('fileObjectList').get(`${cid_temp}`).once(data => {
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
                }}>Download File</button></td>
              </tr>
            )}
          </tbody>
        </table>
    </div>
  );
}

export default Home;
