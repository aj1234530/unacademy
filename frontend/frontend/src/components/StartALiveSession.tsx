import React from 'react'

function StartALiveSession() {
    const [livekittoken, setLivekittoken] = useState('');

    const createALiveSession = () => {
        const response = axios.post("http://localhost:3000/api/v1/createSession", {
            "email": "ak@gmail.com",
            "sessionTitle": "Fullstack class 1",
            "startTime": "2025-12-05T00:00:00Z",
            "status": "INACTIVE"
        })
    }
    const startaliveSession = () => {

    }


    return (
        <div>
            <div className="createlivesession">

                <form>
                    <input ></input>
                    <button onClick={createALiveSession}>Create A Live Session</button>
                </form>
            </div>
            <div className="startalivesession">
                <button onClick={startaliveSession}>Start A Live Session</button>
            </div>
        </div>
    )
}

export default StartALiveSession