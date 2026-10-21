let audioMap = new Map();
let audioMuted = false;

// Pre-load audio files to prevent playback delays and race conditions
export function initAudio(mute = false) {
    const sounds = ["capture", "castle", "check", "checkmate", "click", "error", "move", "promote"];
    audioMap = new Map();
    sounds.forEach(sound => {
        const audio = new Audio(`assets/audio/${sound}.mp3`);
        audio.preload = 'auto';
        audio.muted = mute;
        audioMap.set(sound, audio);
    });

    return audioMap;
}

export function playSound(soundName) {

    const audio = audioMap.get(soundName);

    if (!audio) return;

    // Cloned to prevent race conditions and sound interruption
    const clone = audio.cloneNode();
    clone.muted = audioMuted;

    clone.play()
	.catch(e => console.error(`Could not play sound: ${soundName}`, e));
   
}

export function changeAudio(move) {
    const soundMap = { 
	    "#": "checkmate", 
	    "+": "check", 
	    "x": "capture", 
	    "O-O": "castle", 
	    "=": "promote"
    };

    let sound = "move";

    for (const flag in soundMap) {
        if (move.san.includes(flag)) {
            sound = soundMap[flag];
            break;
        }
    }
    playSound(sound);
}

export function setAudioMuted(mute) {
    audioMuted = mute;

    audioMap.forEach(audio => {
        audio.muted = audioMuted;
    });
}

export function isAudioMuted() {
    return audioMuted;
}

