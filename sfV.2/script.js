document.addEventListener('DOMContentLoaded', () => {
    const startScreen = document.getElementById('start-screen');
    const enterSelectionButton = document.getElementById('enter-selection-button');
    const songSelectionScreen = document.getElementById('song-selection-screen');
    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');
    const songList = document.getElementById('song-list');
    const albumArt = document.getElementById('album-art');
    const songTitle = document.getElementById('song-title');
    const songDescription = document.getElementById('song-description');
    const audioPlayer = document.getElementById('audio-player');
    const exitButton = document.getElementById('exit-button');

    const scoreDisplay = document.getElementById('score-display');
    const comboDisplay = document.getElementById('combo-display');
    const judgementDisplay = document.getElementById('judgement-display');
    const lanes = document.querySelectorAll('.lane');
    const keyIndicators = document.querySelectorAll('.key');

    const keys = ['d', 'f', 'j', 'k'];
    const keyMap = { 'd': 0, 'f': 1, 'j': 2, 'k': 3 };

    let audioContext; // For hit sounds

    function generateBeatmap(bpm, duration) {
        const beatmap = [];
        if (bpm === 0 || duration === 0) return beatmap;
        const beatInterval = 60 / bpm;
        const totalBeats = Math.floor(duration / beatInterval);
        let lastLane = -1;

        for (let i = 0; i < totalBeats; i++) {
            const time = i * beatInterval;
            let lane;
            if (i % 4 === 0) {
                lane = Math.floor(Math.random() * 4);
            } else {
                do {
                    lane = Math.floor(Math.random() * 4);
                } while (lane === lastLane);
            }
            beatmap.push({ time: time + 1.5, lane: lane });
            if (i > 4 && Math.random() > 0.5) {
                beatmap.push({ time: time + beatInterval / 2 + 1.5, lane: Math.floor(Math.random() * 4) });
            }
            if (i > 8 && Math.random() > 0.75) {
                 let secondLane;
                 do {
                    secondLane = Math.floor(Math.random() * 4);
                } while (secondLane === lane);
                beatmap.push({ time: time + 1.5, lane: secondLane });
            }
            lastLane = lane;
        }
        return beatmap.sort((a, b) => a.time - b.time);
    }

    const songs = [
        { name: 'Get Over If You Can', path: 'audio_mp3/Get Over If You Can.mp3', bpm: 102, beatmap: [], description: '노래라는 산을 올라보세요! 물론, 가능하다면요.', svgLogo: '<svg viewBox="0 0 100 100"><polygon points="0,100 30,50 55,75 75,35 100,100" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.5)" stroke-width="2"/></svg>' },
        { name: 'Overtake', path: 'audio_mp3/overtake.mp3', bpm: 110, beatmap: [], description: '우리 게임 중 단언컨대 가장 강렬한 음악입니다.. 아마도요.', svgLogo: '<svg viewBox="0 0 100 100"><polygon points="20,20 50,50 20,80" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="8" /><polygon points="50,20 80,50 50,80" fill="none" stroke="rgba(255,255,255,0.8)" stroke-width="8" /></svg>' },
        { name: 'Starlight Fever', path: 'audio_mp3/StarlightFever.mp3', bpm: 120, beatmap: [], description: '말할 필요 있나요? 전설의 시작입니다.', svgLogo: '<svg viewBox="0 0 100 100"><polygon points="50,5 61,39 98,39 68,61 79,95 50,75 21,95 32,61 2,39 39,39" fill="rgba(255,255,255,0.8)" /></svg>' },
    ];

    let selectedSong, score = 0, combo = 0, noteSpeed = 7, noteIndex = 0, activeNotes = [], animationFrameId;

    // --- Screen & Song Selection Logic ---
    enterSelectionButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        songSelectionScreen.classList.remove('hidden');
        populateSongList();
    });

    function populateSongList() {
        songList.innerHTML = '';
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.textContent = song.name;
            songItem.dataset.songIndex = index;
            songItem.addEventListener('click', () => selectSong(index));
            songList.appendChild(songItem);
        });
        if (songs.length > 0) selectSong(0);
    }

    function selectSong(index) {
        selectedSong = songs[index];
        songTitle.textContent = selectedSong.name;
        songDescription.textContent = selectedSong.description;
        
        const colors = ['#2c3e50', '#c0392b', '#8e44ad'];
        albumArt.style.backgroundColor = colors[index % colors.length];
        albumArt.innerHTML = selectedSong.svgLogo;

        document.querySelectorAll('.song-item.selected').forEach(item => item.classList.remove('selected'));
        document.querySelector(`.song-item[data-song-index="${index}"]`).classList.add('selected');
    }

    // --- Audio & Game Setup ---
    playButton.addEventListener('click', () => {
        if (!selectedSong) return;
        playButton.disabled = true;
        playButton.textContent = 'Loading...';
        audioPlayer.src = selectedSong.path;
        audioPlayer.load();
    });

    exitButton.addEventListener('click', () => {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
    });

    audioPlayer.onloadedmetadata = () => {
        selectedSong.beatmap = generateBeatmap(selectedSong.bpm, audioPlayer.duration);
        startGame();
    };

    audioPlayer.onerror = () => {
        alert('Error loading audio file.');
        playButton.disabled = false;
        playButton.textContent = 'Play';
    };

    function startGame() {
        resetGameState();
        songSelectionScreen.classList.add('hidden');
        gameContainer.classList.remove('hidden');
        audioPlayer.play().catch(e => console.error("Audio play failed:", e));
        animationFrameId = requestAnimationFrame(gameLoop);
        playButton.disabled = false;
        playButton.textContent = 'Play';
    }

    function resetGameState() {
        score = 0, combo = 0, noteIndex = 0;
        if(animationFrameId) cancelAnimationFrame(animationFrameId);
        activeNotes.forEach(note => note.remove());
        activeNotes = [];
        updateScore(0); updateCombo(0);
        judgementDisplay.textContent = '';
    }

    // --- Game Loop & Note Handling ---
    function gameLoop() {
        if (audioPlayer.paused) {
            songSelectionScreen.classList.remove('hidden');
            gameContainer.classList.add('hidden');
            resetGameState();
            return;
        }
        const currentTime = audioPlayer.currentTime;
        const travelTime = 600 / (noteSpeed * 60);
        while (noteIndex < selectedSong.beatmap.length && currentTime >= selectedSong.beatmap[noteIndex].time - travelTime) {
            spawnNote(selectedSong.beatmap[noteIndex]);
            noteIndex++;
        }
        const notesToRemove = [];
        for (const note of activeNotes) {
            const noteInfo = note.noteInfo;
            const spawnTime = noteInfo.time - travelTime;
            const elapsedTime = currentTime - spawnTime;
            note.style.top = (elapsedTime * (noteSpeed * 60)) + 'px';
            if (parseFloat(note.style.top) > 650) {
                notesToRemove.push(note);
                showJudgement('Miss');
                combo = 0;
                updateCombo(0);
            }
        }
        activeNotes = activeNotes.filter(note => !notesToRemove.includes(note));
        notesToRemove.forEach(note => note.remove());
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function spawnNote(noteInfo) {
        const note = document.createElement('div');
        note.classList.add('note');
        note.noteInfo = noteInfo; 
        lanes[noteInfo.lane].appendChild(note);
        activeNotes.push(note);
    }

    // --- Input and Judgement ---
    function handleKeyPress(event) {
        if (gameContainer.classList.contains('hidden')) return;
        const key = event.key.toLowerCase();
        if (!keys.includes(key)) return;
        const laneIndex = keyMap[key];
        const currentTime = audioPlayer.currentTime;
        let bestMatch = null, minTimeDiff = Infinity;

        for (const note of activeNotes) {
            if (note.noteInfo.lane === laneIndex) {
                const timeDiff = Math.abs(note.noteInfo.time - currentTime);
                if (timeDiff < 0.25 && timeDiff < minTimeDiff) {
                    minTimeDiff = timeDiff;
                    bestMatch = note;
                }
            }
        }

        if (bestMatch) {
            let judgement = '';
            if (minTimeDiff < 0.1) { judgement = 'Perfect'; updateScore(100); }
            else if (minTimeDiff < 0.2) { judgement = 'Good'; updateScore(50); }

            if (judgement) {
                showJudgement(judgement);
                updateCombo(combo + 1);
                
                triggerHitEffect(laneIndex, bestMatch);
                activeNotes = activeNotes.filter(n => n !== bestMatch);
            }
        }
        
        keyIndicators[laneIndex].classList.add('active');
        setTimeout(() => keyIndicators[laneIndex].classList.remove('active'), 100);
    }

    function triggerHitEffect(laneIndex, noteElement) {
        // Lane flash
        lanes[laneIndex].classList.add('flash');
        setTimeout(() => lanes[laneIndex].classList.remove('flash'), 150);

        // Note shrink animation
        noteElement.classList.add('hit');
        setTimeout(() => noteElement.remove(), 100);

        // Particle effect
        const particle = document.createElement('div');
        particle.classList.add('hit-particle');
        lanes[laneIndex].appendChild(particle);
        setTimeout(() => particle.remove(), 300);
    }

    function showJudgement(text) {
        const judgementClass = `judgement-${text.toLowerCase()}`;
        judgementDisplay.textContent = text;
        judgementDisplay.classList.add(judgementClass);
        judgementDisplay.style.opacity = 1;
        setTimeout(() => {
            judgementDisplay.style.opacity = 0;
            judgementDisplay.classList.remove(judgementClass);
        }, 500);
    }

    function updateScore(points) {
        score += points;
        scoreDisplay.textContent = `Score: ${score}`;
    }

    function updateCombo(newCombo) {
        combo = newCombo;
        comboDisplay.textContent = `Combo: ${combo}`;
    }

    document.addEventListener('keydown', handleKeyPress);
});