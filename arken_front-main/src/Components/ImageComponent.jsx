import React from 'react'

const ImageComponent = (props) => {
    const { imgPic,alt,styles,className } = props
  return (
    <img style={styles} className={className} src={new URL(imgPic,import.meta.url)} alt={alt} />  
  )
}

export default ImageComponent