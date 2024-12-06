function HomePage() {
    const [livekittoken, setLivekittoken] = useState('');

    const createALiveSession = () => {

    }
    const startaliveSession = () => {

    }


    return (
        <div>
            <div className="createlivesession">
                <button onClick={createALiveSession}>Create A Live Session</button>

            </div>
            <div className="startalivesession">
                <button onClick={startaliveSession}>Start A Live Session</button>
            </div>
        </div>
    )
}

export default HomePage