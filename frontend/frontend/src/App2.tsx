import axios from "axios";
import { useState, useEffect } from "react";
import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useParticipants,
    useParticipantTile,
    useTracks,
    Chat,
    PreJoin,
    VoiceAssistantControlBar,
    ChatEntry,
} from "@livekit/components-react";

import "@livekit/components-styles";

import { ConnectionState, Participant, Track } from "livekit-client";
import UploadForm from "./components/fileupload";

const serverUrl = "ws://localhost:7880";

export default function App() {
    const [roomName, setRoomName] = useState("");
    const [teacherName, setTeacherName] = useState("");
    const [token, setToken] = useState<any>("");

    const handleRoomCreation = async (e: any) => {
        e.preventDefault();
        console.log(roomName, teacherName);
        const response = await axios.post("http://localhost:3000/createClass", {
            roomName: roomName,
            teacherName: teacherName,
        });
        setToken(response.data);
    };
    const [studentRoomName, setStudentRoomName] = useState("");
    const [studentName, setStudentName] = useState("");
    const [studentToken, setStudentToken] = useState<any>("");
    const handleStudentJoining = async (e: any) => {
        e.preventDefault();
        const response = await axios.post("http://localhost:3000/joinClass", {
            roomName: studentRoomName,
            studentName: studentName,
        });
        setStudentToken(response.data);
    };
    return (
        <>

            <div>
                <form onSubmit={handleRoomCreation}>
                    <input
                        placeholder="enter the class name by teacher"
                        onChange={(e) => setRoomName(e.target.value)}
                    />
                    <input
                        placeholder="enter your name"
                        onChange={(e) => setTeacherName(e.target.value)}
                    />
                    <button type="submit">Create class</button>
                </form>
            </div>
            <div>
                {/* need to enter the same room name */}
                <form onSubmit={handleStudentJoining}>
                    <input
                        placeholder="enter the class name"
                        onChange={(e) => setStudentRoomName(e.target.value)}
                    />
                    <input
                        placeholder="enter your name"
                        onChange={(e) => setStudentName(e.target.value)}
                    />
                    <button type="submit">Join class</button>
                </form>
            </div>

            <LiveKitRoom
                video={true}
                audio={true}
                token={token || studentToken}
                serverUrl={serverUrl}
                // Use the default LiveKit theme for nice styles.
                data-lk-theme="default"
                style={{ height: "100vh" }}
            >
                {/* Your custom component with basic video conferencing functionality. */}
                <MyVideoConference />
                {/* The RoomAudioRenderer takes care of room-wide audio for you. */}
                <RoomAudioRenderer />
                {/* Controls for the user to start/stop audio, video, and screen
        share tracks and to leave the room. */}
                <ControlBar />
                <VoiceAssistantControlBar />
                <Chat>
                </Chat>
            </LiveKitRoom>
        </>
    );
}

function MyVideoConference() {
    // `useTracks` returns all camera and screen share tracks. If a user
    // joins without a published camera track, a placeholder track is returned.
    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: false },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ]

        // { onlySubscribed: false },
    );

    return (
        <GridLayout
            tracks={tracks}
            style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}
        >
            {/* The GridLayout accepts zero or one child. The child is used
        as a template to render all passed in tracks. */}

            <ParticipantTile />
        </GridLayout>
    );
}

// useEffect(() => {
//     const fetchToken = async () => {
//         try {
//             const response = await axios.get("http://localhost:3000/getToken");
//             console.log("Token fetched:", response.data);
//             setToken(response.data);
//         } catch (err) {
//             console.error("Error fetching token:", err);
//             setError("Failed to fetch token.");
//         }
//     };

//     fetchToken();
// }, []);

// UploadForm.tsx

