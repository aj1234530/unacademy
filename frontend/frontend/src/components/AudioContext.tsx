import React, { useState } from 'react';

const AudioPlayer: React.FC = () => {
    // Create a new AudioContext instance
    const [audioContext] = useState<AudioContext>(
        new (window.AudioContext || (window as any).webkitAudioContext)()
    );

    // Handle the click event to start the audio
    const handleStartAudio = () => {
        // Check if the AudioContext is suspended and resume it after a user gesture (click)
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        // Create an oscillator (a simple tone generator)
        const oscillator = audioContext.createOscillator();
        oscillator.type = 'sine'; // This sets the wave shape to sine (smooth sound)
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // Set frequency to 440Hz (A4 note)

        // Connect the oscillator to the audio context's destination (usually the speakers)
        oscillator.connect(audioContext.destination);

        // Start the oscillator (sound will start playing)
        oscillator.start();

        // Stop the oscillator after 1 second (optional)
        setTimeout(() => {
            oscillator.stop();
        }, 1000);
    };

    return (
        <div>
            <h1>Click to Start Audio</h1>
            <button onClick={handleStartAudio}>Start Audio</button>
        </div>
    );
};

export default AudioPlayer;