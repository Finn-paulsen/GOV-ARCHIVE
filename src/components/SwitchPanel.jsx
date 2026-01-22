import React from 'react'

function Toggle({label}){
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
      <div className="btn-physical">{label}</div>
      <div style={{width:48,height:8,background:'linear-gradient(90deg,#081818,#0b2b2b)',borderRadius:12,boxShadow:'inset 0 2px 6px rgba(255,255,255,0.02)'}}></div>
    </div>
  )
}

export default function SwitchPanel(){
  return (
    <div className="switch-panel">
      <Toggle label="POWER" />
      <Toggle label="AUDIO" />
      <Toggle label="RADIO" />
    </div>
  )
}
