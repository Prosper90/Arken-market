import React from 'react'
import { moderateScale } from '../utils/Scale'

const HeadingText = (props) => {
  const { content,fontSize } = props
  return (
    <h3 style={{fontSize:`${moderateScale(fontSize)}px`}} >{content}</h3>
  )
}

export default HeadingText