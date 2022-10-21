import React from "react";
import './routes-css/upload-file.css';
import { Web3Storage } from 'web3.storage';

const client = new Web3Storage({token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDdlQzY1QkMwZTU4NEFCNEFFQjdhZjMyNjdEMjI5MTZDOTQ1NUJBNkQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2NjM0NTgzMzEwMTUsIm5hbWUiOiJjcDItbWluZXJ2YS1kbS1mc3MifQ.b4RKubGBnqq_x37Dm8xkocGvs05evwyS0x1U6_4CS5E'});

function UploadFile({userInstance, handleClose, show}) {

  let fileInput = React.createRef();

  async function generateKeyFunction(){
    return crypto.subtle.generateKey({ 'name': 'AES-CBC', 'length': 256 }, true, ['encrypt', 'decrypt']);
  }

  async function HandleSubmit(event){
    event.preventDefault();

    let fileName, fileNameNoWhiteSpace, lastModdifiedVar, CID, fileFormat, exportedKey;
    const fr = new FileReader();

    const getFileType = fileInput.current.files[0].type; // get the blob type to pass it later at the Blob() constructor
    fileName = fileInput.current.files[0].name;
    fileNameNoWhiteSpace = fileInput.current.files[0].name.replaceAll(" ", "");
    lastModdifiedVar = fileInput.current.files[0].lastModdified;
    
    console.log(fileInput.current.files[0]);
    
    fr.readAsArrayBuffer(fileInput.current.files[0]);

    fr.addEventListener('load', async (e)=>{
      let data = e.target.result; // e.target.result is similar to fr.result
      let iv = crypto.getRandomValues(new Uint8Array(16));
      const key = await generateKeyFunction();
      console.log(data);
      console.log(iv);
      
      crypto.subtle.encrypt({ 'name': 'AES-CBC', iv }, key, data)
      .then(async encrypted => {
          console.log(encrypted); // encrypted is an ArrayBuffer
          alert('The encrypted data is ' + encrypted.byteLength + ' bytes long'); // encrypted is an ArrayBuffer
          fileFormat = new File([encrypted], fileNameNoWhiteSpace, {type: getFileType, lastModified: lastModdifiedVar} ) // convert encrypted arraybuffer to blob.
          console.log("ENCRYPTED:");
          console.log(fileFormat);
          console.log("KEY USED TO ENCRYPT FILE");
          console.log(key);
          const fileInArray = [fileFormat];

          //Export CryptoKey in a JSON web key format
          let exportedKey = await crypto.subtle.exportKey("jwk", key);
          let parsedExportedKey = JSON.stringify(exportedKey, null, " ");
          console.log(parsedExportedKey);
          let parsedInitializationVector = window.btoa(String.fromCharCode.apply(null, iv));
          console.log(parsedInitializationVector);


          const res_CID = await client.put(fileInArray);
          
          CID = res_CID;

/*           let obj = userInstance.get("obj").put({filenameProperty: fileName, CID_prop: CID, jsonKey: exportedKey}); */

          await userInstance.get('fileObjectList').set(`${fileName}`).put({
            filenameProperty: fileName, 
            filenameWithNoWhiteSpace: fileNameNoWhiteSpace, 
            CID_prop: CID, 
            fileKey: parsedExportedKey, 
            iv: parsedInitializationVector, 
            fileType: getFileType
          }); // set of names - each node is an object with a file name and corresponding CID

          alert("FILE ADDED");
          window.location.reload();

      }).catch(console.error);
    });


    //WARNING: The following code may execute first before the crypto.subtle.encrypt() "promise" process ends.

/*     const res_CID = await client.put(blobFormat);
    
    fileName = fileInput.current.files[0].name;
    CID = res_CID;

    userInstance.get('fileObjectList').set(`${CID}`).put({filenameProperty: fileName, CID_prop: CID, isEncrypted: (exportedKey ? true : false)}); // set of names - each node is an object with a file name and corresponding CID
    alert("FILE ADDED"); */
  }

  const toggleClassname = show ? "modal modal-container" : "modal display-none";
  return (
    <div className={toggleClassname}>
      <div className="upload-container">
        <div className="title-container">
          <h3>Upload Document</h3>
          <button onClick={handleClose}>X</button>
        </div>
        <form className="flex-upload-container" >
          <div className="flex-item1">
            <label>Upload File(s): </label>
            <input type="file" accept=".doc,.DOC,.docx,.DOCX,.txt,TXT" className="upload-btn-class" ref={fileInput}></input>
          </div>
          <div className="flex-item2">
            <label>Choose Where to Pin Data:</label>
            <div className="checkbox-container">
              <input type="checkbox" name="web3storage" value="web3storage"/>
              <label> Web3Storage</label><br/>
              <input type="checkbox" name="ipfsLocal" value="local"/>
              <label> My own IPFS node</label><br/>
            </div>
          </div>
          <div className="flex-item-last">
            <button type="submit" className="submit-btn" onClick={HandleSubmit}>Upload</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadFile;
