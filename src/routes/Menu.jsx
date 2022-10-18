import React ,{useState} from 'react'
import {CopyToClipboard} from 'react-copy-to-clipboard';

const Menu = ({cid}) => {

  const [copied,setCopied] = useState(false);

  function clicked(e){
    alert("CID copied!");
  }

  return (
    <div className='Context-Menu'>

        
        <CopyToClipboard text={cid} onCopy={() => setCopied(true)} className='CopyCid-Menu'>
          <button onClick={clicked}>Copy CID</button>
        </CopyToClipboard>

        <button className="Download-Menu">Download</button>

    </div>

    
  )
}

export default Menu
