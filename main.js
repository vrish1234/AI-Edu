// ==================== Config / Keys ====================
const geminiAPIKey = "AIzaSyBhS1Ispvv6A4P-TvqK_X8srNuI5ZSlLH0";

// === Google Search API Keys ===
const GOOGLE_API_KEY = "AIzaSyDZ8nqex-SO45WrsSk8ZQG7-wowmKVTP6U";
const SEARCH_ENGINE_ID = "b222fc6691768427a";

// === YouTube API Key ===
const YOUTUBE_API_KEY = "AIzaSyArUsfSQvLUZf8wC8MbkW_zvtIP2KbEdB0";

// === Loader HTML ===
const loaderHTML = `<div class="loader"></div>`;

// ==================== Gemini / Answer Fetching ====================
async function fetchAnswerFromGemini(question, language) {
  const prompt = `Answer the following question strictly in ${language}:\n${question}`;
  const shortPrompt = `Now, summarize the above answer into 3-5 short bullet points using ${language} only.`;

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": geminiAPIKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );

    if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
    const data = await response.json();
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Answer not available.";

    const summaryResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-goog-api-key": geminiAPIKey },
        body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n${answer}\n${shortPrompt}` }] }] }),
      }
    );

    if (!summaryResponse.ok) throw new Error(`Gemini API Error: ${summaryResponse.status}`);
    const summaryData = await summaryResponse.json();
    const shortNotes = summaryData.candidates?.[0]?.content?.parts?.[0]?.text || "Short notes not available.";

    return { answer, shortNotes };
  } catch (err) {
    throw err;
  }
}

// ==================== Helpers: diagram, ppt/pdf ====================
function needsDiagram(question) {
  const keywords = ["diagram", "chart", "graph", "flowchart", "schematic", "drawing", "block diagram"];
  return keywords.some(word => question.toLowerCase().includes(word));
}

async function fetchDiagramImage(query) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query + " diagram")}&searchType=image&num=1&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.[0]?.link || null;
  } catch {
    return null;
  }
}

async function fetchPptPdfLinks(query) {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query + " (filetype:ppt OR filetype:pdf)")}&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.items?.slice(0, 3).map(item => ({ title: item.title, link: item.link })) || [];
  } catch {
    return [];
  }
}

// ==================== Fetch YouTube Video with Language Preference ====================
async function fetchYouTubeVideo(query, language) {
  const langQuery = `${query} ${language} explanation`;
  const fallbackQuery = `${query} Hindi explanation`;

  async function searchYouTube(searchText) {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&maxResults=1&q=${encodeURIComponent(searchText)}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data.items?.[0]?.id?.videoId || null;
  }

  let videoId = await searchYouTube(langQuery);
  if (!videoId && language !== "Hindi") {
    videoId = await searchYouTube(fallbackQuery);
  }
  return videoId;
}

// ==================== Language codes for TTS ====================
function getLangCode(lang) {
  const codes = {
    English: 'en-US',
    Hindi: 'hi-IN',
    Magahi: 'hi-IN',
    Maithili: 'hi-IN',
    Bhojpuri: 'hi-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Bengali: 'bn-IN',
    Rajasthani: 'hi-IN',
    Gujarati: 'gu-IN',
    Punjabi: 'pa-IN',
  };
  return codes[lang] || 'en-US';
}

// ==================== YouTube IFrame API Integration ====================
let ytPlayer = null;
let pendingVideoId = null;
let ytApiLoaded = false;

function loadYouTubeIframeAPI() {
  if (ytApiLoaded) return;
  ytApiLoaded = true;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
  window.onYouTubeIframeAPIReady = () => { if (pendingVideoId) createYouTubePlayer(pendingVideoId); };
}

function createYouTubePlayer(videoId) {
  if (ytPlayer && ytPlayer.destroy) ytPlayer.destroy();
  ytPlayer = new YT.Player("ytplayer", {
    height: "315",
    width: "560",
    videoId,
    playerVars: { rel: 0, modestbranding: 1, controls: 1 },
    events: { onStateChange: onYtPlayerStateChange }
  });
}

function onYtPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) speechSynthesis.cancel();
}

// ==================== Main ====================
async function getAnswer() {
  const question = document.getElementById('question')?.value || "";
  const language = document.getElementById('language')?.value || "English";
  const responseText = document.getElementById('responseText');
  const shortNotesText = document.getElementById('shortNotesText');
  const pptPdfContainer = document.getElementById('pptPdfLinks');
  const diagramContainer = document.getElementById('diagramContainer');
  const youtubeContainer = document.getElementById('youtubeContainer');

  if (!question.trim()) return alert("Please enter your question.");

  // === Loader show ===
  responseText.innerHTML = loaderHTML;
  shortNotesText.innerText = "";
  pptPdfContainer.innerHTML = "";
  diagramContainer.innerHTML = "";
  youtubeContainer.innerHTML = "";

  try {
    const { answer, shortNotes } = await fetchAnswerFromGemini(question, language);

    // === Loader remove and show content ===
    responseText.innerText = answer;
    shortNotesText.innerText = shortNotes;

    if (needsDiagram(question)) {
      const imgURL = await fetchDiagramImage(question);
      if (imgURL) {
        const img = document.createElement("img");
        img.src = imgURL;
        img.style.maxWidth = "400px";
        diagramContainer.appendChild(img);
      }
    }

    // TTS
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(answer);
    utter.lang = getLangCode(language);
    speechSynthesis.speak(utter);

    // PPT/PDF
    const links = await fetchPptPdfLinks(question);
    pptPdfContainer.innerHTML = links.length
      ? "<h4>📂 Related PPT/PDF:</h4>" + links.map(l => `<a href="${l.link}" target="_blank">🔗 ${l.title}</a><br>`).join("")
      : "<p>No PPT/PDF found.</p>";

    // YouTube Video
    const videoId = await fetchYouTubeVideo(question, language);
    if (videoId) {
      youtubeContainer.innerHTML = `<h4>🎥 Related YouTube Video:</h4><div id="ytplayer"></div>`;
      pendingVideoId = videoId;
      loadYouTubeIframeAPI();
      if (window.YT && window.YT.Player) createYouTubePlayer(videoId);
    } else {
      youtubeContainer.innerHTML = "<p>No suitable YouTube video found.</p>";
    }
  } catch (err) {
    responseText.innerText = "Error fetching answer.";
    console.error(err);
  }
}


// --- Voice Input ---
function startVoiceInput() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = getLangCode(document.getElementById('language').value);
  recognition.onresult = function (event) {
    document.getElementById('question').value = event.results[0][0].transcript;
  };
  recognition.start();
}

// --- Image Input ---
function captureImage() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function () {
      const imageText = await extractTextFromImage(reader.result);
      document.getElementById('question').value = imageText;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// --- OCR ---
async function extractTextFromImage(base64Image) {
  try {
    const { createWorker } = Tesseract;
    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(base64Image);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "Could not extract text from image.";
  }
}

// --- Dark Mode Toggle ---
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const themeIcon = document.getElementById("themeIcon");
  themeIcon.textContent = document.body.classList.contains("dark-mode") ? "🌙" : "🌞";
}

