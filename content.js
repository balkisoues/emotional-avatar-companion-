// --- Create avatar ---
const avatar = document.createElement('div');
avatar.id = 'emotion-avatar-companion';
avatar.dataset.defaultEmoji = '😊';
avatar.textContent = avatar.dataset.defaultEmoji;
document.body.appendChild(avatar);

// --- Simple stemmer function ---
function stem(word) {
  return word.toLowerCase().replace(/(ing|ed|ly|s)$/,''); // basic suffix removal
}

// --- Emotions with weights ---
const emotions = {
  '😊': { keywords: ['happy','good','great','awesome','wonderful','love','excellent'].map(stem), weight: 1 },
  '😢': { keywords: ['sad','unhappy','crying','depressed','miserable'].map(stem), weight: 1 },
  '😡': { keywords: ['angry','mad','furious','annoyed','hate','frustrated','frustrating','nerves'].map(stem), weight: 1.2 },
  '😰': { keywords: ['worried','anxious','nervous','scared','panic'].map(stem), weight: 1.1 },
  '😴': { keywords: ['tired','sleepy','exhausted','bored','sleep'].map(stem), weight: 0.8 },
  '😍': { keywords: ['love','adore','crush','beautiful'].map(stem), weight: 1.5 },
  '🤔': { keywords: ['think','wonder','curious','confused','maybe'].map(stem), weight: 1 },
  '😂': { keywords: ['lol','haha','funny','joke'].map(stem), weight: 1.3 },
  '😎': { keywords: ['cool','confident','winning','success'].map(stem), weight: 1.2 },
  '🤗': { keywords: ['hug','care','support','friendly'].map(stem), weight: 1 },
  '😤': { keywords: ['determined','motivated','ready','pumped'].map(stem), weight: 1.4 },
  '😌': { keywords: ['calm','peaceful','relaxed','serene','zen'].map(stem), weight: 0.9 }
};

// Map for fast keyword lookup
const keywordMap = new Map();
for (const [emoji, data] of Object.entries(emotions)) {
  for (const kw of data.keywords) {
    keywordMap.set(kw, {emoji, weight: data.weight});
  }
}

let currentEmotion = avatar.dataset.defaultEmoji;
let typingTimer;
let lastInputTime = Date.now();

// --- Detect strongest emotion with weights and stemming ---
function detectEmotion(text) {
  const words = text.toLowerCase().split(/\W+/).map(stem); // stem all input words
  const scores = {};

  for (const word of words) {
    if (keywordMap.has(word)) {
      const {emoji, weight} = keywordMap.get(word);
      scores[emoji] = (scores[emoji] || 0) + weight;
    }
  }

  let bestEmoji = avatar.dataset.defaultEmoji;
  let maxScore = 0;
  for (const [emoji, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestEmoji = emoji;
    }
  }

  // Typing speed bonus
  const speed = Date.now() - lastInputTime;
  lastInputTime = Date.now();
  if (speed < 150 && bestEmoji === '😊') bestEmoji = '😂'; // playful fast typing

  return bestEmoji;
}

// --- Update avatar with multiple effects ---
function updateAvatar(emotion) {
  if (emotion !== currentEmotion) {
    currentEmotion = emotion;
    avatar.textContent = emotion;

    // Color change based on emotion
    const colorMap = {
      '😊':'#fff9c4','😢':'#bbdefb','😡':'#ffcdd2','😰':'#ffecb3','😴':'#e0e0e0',
      '😍':'#f8bbd0','🤔':'#cfd8dc','😂':'#ffe0b2','😎':'#c8e6c9','🤗':'#d1c4e9',
      '😤':'#ffe082','😌':'#b2dfdb'
    };
    avatar.style.background = colorMap[emotion] || '#fff';

    avatar.classList.add('pulse','fade');
    setTimeout(()=> avatar.classList.remove('pulse','fade'),500);

    // Tooltip with detected keywords
    const detected = Object.entries(emotions)
      .filter(([e,data]) => e === emotion)
      .map(([e,data]) => data.keywords.join(', '))
      .join('; ');
    avatar.title = detected;
  }
}

// --- Listen to input fields ---
document.addEventListener('input', e => {
  if(e.target.matches('input[type="text"], input[type="search"], textarea, [contenteditable="true"]')) {
    clearTimeout(typingTimer);
    const text = e.target.value || e.target.textContent || '';
    typingTimer = setTimeout(()=> updateAvatar(detectEmotion(text)), 200);

    // Smooth follow cursor
    const rect = e.target.getBoundingClientRect();
    avatar.style.top = `${rect.top + window.scrollY - 80}px`;
    avatar.style.left = `${rect.left + window.scrollX}px`;
  }
});

// --- Draggable avatar ---
let dragging = false, offsetX, offsetY;
avatar.addEventListener('mousedown', e=>{
  dragging=true;
  offsetX=e.clientX-avatar.offsetLeft;
  offsetY=e.clientY-avatar.offsetTop;
  avatar.style.cursor='grabbing';
});
document.addEventListener('mousemove', e=>{
  if(dragging){
    avatar.style.top = (e.clientY-offsetY)+'px';
    avatar.style.left = (e.clientX-offsetX)+'px';
  }
});
document.addEventListener('mouseup', ()=>{ dragging=false; avatar.style.cursor='move'; });

