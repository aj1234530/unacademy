import { useState, useEffect } from "react";
import axios from "axios";
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { Track } from "livekit-client";
import AudioPlayer from "./components/AudioContext";
import UploadForm from "./components/fileupload";

const serverUrl = "ws://localhost:7880";

export default function App() {
    const [token, setToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const response = await axios.get("http://localhost:3000/getToken");
                console.log("Token fetched:", response.data);
                setToken(response.data);
            } catch (err) {
                console.error("Error fetching token:", err);
                setError("Failed to fetch token.");
            }
        };

        fetchToken();
    }, []);

    if (!token) {
        return (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                {error ? <p style={{ color: "red" }}>{error}</p> : <p>Loading token...</p>}
            </div>
        );
    }

    return (
        <>
            <UploadForm />
            <AudioPlayer /> {/* This is for audio context, not working as of now */}
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={serverUrl}
                data-lk-theme="default"
                style={{ height: "100vh" }}
            >
                <MyVideoConference />
                <RoomAudioRenderer />
                <ControlBar />
            </LiveKitRoom>
        </>
    );
}

function MyVideoConference() {
    // Fetching tracks from participants (camera and screen share)
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false }
    );

    return (
        <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
            <ParticipantTile />
        </GridLayout>
    );
}