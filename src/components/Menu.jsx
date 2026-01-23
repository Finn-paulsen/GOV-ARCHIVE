import React from 'react'

const items = [
  {id:'bio', label:'Biografie'},
  {id:'timeline', label:'Timeline'},
  {id:'trials', label:'Gerichtsverfahren'},
  {id:'network', label:'Netzwerk'},
  {id:'sources', label:'Quellen'},
  {id:'browser', label:'Browser'},
]

export default function Menu({ current, onChange }){
  return (
    <nav className="menu" role="navigation" aria-label="Hauptmenü">
      {items.map(i=> (
        <button key={i.id} onClick={()=>onChange(i.id)} className={current===i.id? 'active':''}>{i.label}</button>
      ))}
    </nav>
  )
}
