import React ,{useState} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const Menu = ({fileElement}) => {

  const [copied,setCopied] = useState(false);

  function clicked(e){
    alert("CID copied!");
  }
  function handleDownloadEvent(fileElementItem){
    let ivParsed = JSON.parse(fileElement.iv);
    let initializationVector = Uint8Array.from(ivParsed);
    let filename = fileElementItem.filename;
    let filenameWithNoWhiteSpace = fileElementItem.filenameWithNoWhiteSpace;
    let CID = fileElementItem.cid;
    let jsonParseFileKey = JSON.parse(fileElementItem.fileKey);
    let fileType = fileElementItem.fileType;

    console.log(initializationVector);

    crypto.subtle.importKey("jwk", jsonParseFileKey, { 'name': 'AES-CBC' }, true, ['encrypt', 'decrypt']).then(cryptoKeyImported =>{
      fetch(`https://${CID}.ipfs.w3s.link/ipfs/${CID}/${filenameWithNoWhiteSpace}`).then(res => {
        let result = res.blob(); // Convert to blob() format
        console.log(result);
        return result;
      }).then(async res => {
  
          // Convert blob to arraybuffer
          const fileArrayBuffer = await new Response(res).arrayBuffer();
  
          crypto.subtle.decrypt({ 'name': 'AES-CBC', initializationVector }, cryptoKeyImported, fileArrayBuffer).then(decrypted => {
            //Convert ArrayBuffer to Blob and Download
            const blob = new Blob([decrypted], {type: fileType} ) // convert decrypted arraybuffer to blob.
            const aElement = document.createElement('a');
            aElement.setAttribute('download', `${filename}`);
            const href = URL.createObjectURL(blob);
            aElement.href = href;
            aElement.setAttribute('target', '_blank');
            aElement.click();
            URL.revokeObjectURL(href);
  
          }).catch(console.error);
        
      })
  
    })
    

  }

  return (
    <div className='Context-Menu'>

        
        <CopyToClipboard text={fileElement.cid} onCopy={() => setCopied(true)} className='CopyCid-Menu'>
          <button onClick={clicked}>Copy CID</button>
        </CopyToClipboard>

        <button className="Download-Menu" onClick={()=> {handleDownloadEvent(fileElement)} }>Download</button>

    </div>

    
  )
}

export default Menu
