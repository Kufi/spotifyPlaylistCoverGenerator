import React from "react"



export default function Login(props) {
  return (
      <a className="my-auto text-lg font-bold bg-green-400 p-3 px-6 rounded-full" href={props.authUrl}>
        Login With Spotify
      </a>
  )
}