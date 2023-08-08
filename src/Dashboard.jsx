import React from "react";
import Playlist from "./Playlist";
import blank from "./assets/null.png"

export default function Dashboard(props) {

    
    const [playlistData, setPlaylistData] = React.useState([])

    const [searchWord, setSearchWord] = React.useState("");

    const [selectedName, setSelectedName] = React.useState("");

    const [generatedImage, setGeneratedImage] = React.useState(blank);

    const [infoText, setInfoText] = React.useState("Generate a new cover based on your playlist's songs using AI")

    const getName = function(string) {
        let result = string.substring(33)
        result = result.split('/')[0]
        return result
    }

    const addPlaylists = function(playlists, name) {
        for(const playlist of playlists) {
            if(playlist.owner.display_name == name){
                 
                setPlaylistData( (prev) => [...prev, playlist] )
            }
        }
        
        // console.log(playlistData)
    }

    const getPlaylists = async function(data){
        let currentData = data;
        const name = getName(currentData.href);
        addPlaylists(currentData.items, name)
        while(currentData.next !== null){
            
            currentData = await fetch(currentData.next, {
                headers: {
                    'Authorization': 'Bearer ' + props.token
                }
                }).then(res => res.json())
                .then(result => {
                    return result;
                });
            addPlaylists(currentData.items, name)

        }
    }

    React.useEffect( () => {
        fetch('https://api.spotify.com/v1/me/playlists?offset=0&limit=20', {
            headers: {
                'Authorization': 'Bearer ' + props.token
            }
        }).then(res => res.json())
        .then(result => {
            
            getPlaylists(result)
            
        });
    }, [])

    const select = function(playlistName){
        setSelectedName(playlistName);
    }

    const clearSelect = function(){
        setInfoText("Generate a new cover based on your playlist's songs using AI")
        setSelectedName("");
        setGeneratedImage(blank);
    }
    
    const stringifySongs = function(songs){
        let result = "";
        for(const song of songs){
            const str = `"${song.track.name}" by ${song.track.artists[0].name}, `
            result += str;
        }
        return result;
    }


    function convertImageToBase64(imgUrl, callback) {
        const image = new Image();
        image.crossOrigin='anonymous';
        image.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.height = image.naturalHeight;
          canvas.width = image.naturalWidth;
          ctx.drawImage(image, 0, 0);
          const dataUrl = canvas.toDataURL();
          callback && callback(dataUrl)
        }
        image.src = imgUrl;
      }



    const openImage = function(){

        if(generatedImage === blank){
            setInfoText("Please generate an image first")
            return
        } 

        window.open(generatedImage, '_blank');
    }

    const generateImage = async function(){
        setInfoText("Retreiving songs...")
        console.log("playlist to gen VVVV")
        console.log(selectedPlaylist);

       console.log("getting songs...")

        const songs = await fetch(selectedPlaylist.tracks.href, {
            headers: {
                'Authorization': 'Bearer ' + props.token
            }
            }).then(res => res.json())
            .then(result => {
                return result;
            });

        const songsString = stringifySongs(songs.items);

        setInfoText("Writing prompt...")

        console.log("getting prompt...")
        
        let prompt =  await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-XXXXXXXXXXXXXXXXXXX'
            },

            body: JSON.stringify({
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {
                        'role': 'user',
                        'content': `describe a single artwork that encapsulates the following songs, "${songsString}" in 350 characters or less`
                    },
                ]
            })
            }).then(res => {
                if(!res.ok){
                    let err = new Error("HTTP status code: " + response.status);
                    err.response = res;
                    err.status = res.status;
                    console.log("not ok");
                    console.log(err);
                }
                return res.json()
            })
            .then(result => {
                return result.choices[0].message.content
            })
            .catch(err => {
                console.log("ERRROR")
                console.log(err);
            })

        console.log(prompt);

        if(prompt.length >= 1000){
            prompt = prompt.substring(0, 999);
        }

        setInfoText("Generating image...")


        console.log("generating image....")

        const image = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer sk-XXXXXXXXXXXXXXXXXXX'
          },
          body: JSON.stringify({
              'prompt': prompt,
              'n': 2,
              'size': '512x512'
          })
        }).then(res => res.json())
        .then(data => {
            console.log(data)
            return data
        })
        .catch(err => {
            console.log("image error")
            // console.log(err);
            setInfoText(err.message)
        });
        if(image.data) {
            setGeneratedImage(image.data[0].url);
            setInfoText("Complete")
        }
        else
            setInfoText("Error: Explicit Content")
        
        

    }

    const selectedPlaylist = playlistData.find(playlist => playlist.name === selectedName);

    let selectedImage = blank
    if(selectedName){
        if(selectedPlaylist.images[0]){
            selectedImage = selectedPlaylist.images[0].url;
        }
    }

    const filteredPlaylists = playlistData.filter( (playlist) => {
        return playlist.name.match(searchWord)
    })
    const playlistElements = filteredPlaylists.map( (playlist) => {
        let imgUrl = blank
        if(playlist.images[0]){
            imgUrl = playlist.images[0].url
        }
        return <Playlist key={playlist.name} handleClick={select} name={playlist.name} songs={playlist.tracks.total} url={imgUrl} />
    })

    


    const handleChange = function(e) {
        e.preventDefault();
        setSearchWord(e.target.value);
    } 



    return (
        <div className={selectedName ? "my-auto" : ""}>
            {selectedName ?
                (
                    <div className="flex  flex-col justify-center items-center w-[72rem">
                        <h1 className="text-2xl mb-5 text-gray-500 font-light"> {infoText}</h1>
                        <div className="flex justify-between">
                            <Playlist key={selectedPlaylist.name} handleClick={select} name={selectedPlaylist.name} songs={selectedPlaylist.tracks.total} url={selectedImage} />

                            <svg className="mt-[6rem] mx-6" fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="80" viewBox="0 0 51.388 51.388" xml:space="preserve">
                            <g>
                                <g>
                                    <path d="M9.169,51.388c-0.351,0-0.701-0.157-0.93-0.463c-0.388-0.514-0.288-1.243,0.227-1.634l31.066-23.598L8.461,2.098
                                        C7.95,1.708,7.85,0.977,8.237,0.463c0.395-0.517,1.126-0.615,1.64-0.225l33.51,25.456L9.877,51.151
                                        C9.664,51.31,9.415,51.388,9.169,51.388z"/>
                                </g>
                            </g>
                            </svg>

                            <Playlist handleClick={select} name={selectedPlaylist.name} songs={selectedPlaylist.tracks.total} url={generatedImage} />
                        </div>
                        <div className="flex  justify-between mb-8">
                            <button onClick={clearSelect} className="bg-slate-500  active:translate-y-1 w-[10rem] text-md mx-6 font-bold hover:bg-slate-400 text-slate-50 rounded-lg p-2" >Playlist View</button>
                            <button onClick={generateImage} className="bg-blue-500  active:translate-y-1 w-[10rem] hover:bg-blue-400  text-md mx-6 font-bold text-slate-50 rounded-lg p-2" >Genereate Image</button>
                            <button onClick={openImage} className="bg-indigo-500  active:translate-y-1 w-[10rem] hover:bg-indigo-400  text-md mx-6 font-bold text-slate-50 rounded-lg p-2" >Open Image</button>
                            
                        </div>
                    </div>
                    
                )
            
            :
            <div className="flex flex-col justify-center max-w-6xl items-">
                
                <input className="my-3 w-full mt-8 h-14 text-2xl font-light px-3 "
                    type="search"
                    placeholder="Search here"
                    onChange={handleChange}
                    value={searchWord} />   

                    <div className="flex flex-wrap justify-center">
                        
                            {playlistElements}
                            <div className="w-60 m-4 "></div>
                            <div className="w-60 m-4 "></div>
                            <div className="w-60 m-4 "></div>
                            <div className="w-60 m-4 "></div>
                            <div className="w-60 m-4 "></div>``
                    </div>

            </div>
            }
        </div>
    )
}