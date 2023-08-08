import React from "react";


export default function Playlist(props){
    
    return (
        <div  className="w-60 m-4">
            <img onClick={()=>props.handleClick(props.name)} className="h-60 object-cover w-60 rounded-md hover:scale-105 transition-transform ease-in-out active:translate-y-1 shadow-md" src={props.url} alt="" />
            <div className="flex justify-between py-2 items-center">
                <h1 className="text-xl  font-bold   overflow-hidden truncate">{props.name}</h1>
                {/* <h2 className="text-2xl font-light text-indigo-400 ml-2">{props.songs} Songs</h2> */}
            </div>
        </div>
    )
}