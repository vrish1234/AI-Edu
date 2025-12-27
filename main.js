// ================== API KEYS ==================
const geminiAPIKey = "AIzaSyBAgbP2F9mpphZrXc3qbuVIhwUp2sqz0g0";
// === Google Search API Keys ===
const GOOGLE_API_KEY = "AIzaSyDf6fjW4nMrdM3V1fvM8sO2kS8gbvrEKBQ";
const SEARCH_ENGINE_ID = "66e5361e4c83040a8";
const YOUTUBE_API_KEY = "AIzaSyArUsfSQvLUZf8wC8MbkW_zvtIP2KbEdB0";

// ================== CHAT STATE ==================
let selectedLanguage = "English";
let lastUtter = null;

// ================== INIT ==================
window.addEventListener("DOMContentLoaded", () => {
  stopTTS();
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeIcon").textContent = "☀️";
  }

  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = JSON.parse(localStorage.getItem("user"));
  if (isLoggedIn && user) {
    showChatUI(user);
  } else {
    toggleAuth("register");
  }

  attachStopSpeechEvents();
});

// ================== TTS CONTROL ==================
let speechUtterance = null;
let isSpeaking = false;
let isPaused = false;

function toggleSpeechOutput() {
  const responseText =
    document.getElementById("responseText")?.innerText || "";
  if (!responseText.trim()) {
    alert("No response to speak.");
    return;
  }
  if (!isSpeaking) {
    speechUtterance = new SpeechSynthesisUtterance(responseText);
    speechSynthesis.speak(speechUtterance);
    isSpeaking = true;
    isPaused = false;
    speechUtterance.onend = () => {
      isSpeaking = false;
      isPaused = false;
    };
  } else if (isPaused) {
    speechSynthesis.resume();
    isPaused = false;
  } else {
    speechSynthesis.pause();
    isPaused = true;
  }
}

function stopTTS() {
  if ("speechSynthesis" in window) {
    speechSynthesis.cancel();
    lastUtter = null;
    isSpeaking = false;
    isPaused = false;
  }
}

// ================== LANGUAGE ==================
function selectLanguage(lang) {
  stopTTS();
  selectedLanguage = lang;
  const iconEl = document.getElementById("languageIcon");
  if (iconEl) iconEl.textContent = langIcon(lang);
  console.log("Language changed:", lang);
}

function getLangCode(lang) {
  const codes = {
    English: "en-US",
    Hindi: "hi-IN",
    Magahi: "hi-IN",
    Maithili: "hi-IN",
    Bhojpuri: "hi-IN",
    Tamil: "ta-IN",
    Telugu: "te-IN",
    Bengali: "bn-IN",
    Rajasthani: "hi-IN",
    Gujarati: "gu-IN",
    Punjabi: "pa-IN",
  };
  return codes[lang] || "en-US";
}
function langIcon(lang) {
  const icons = {
    English: "🇬🇧",
    Hindi: "🇮🇳",
    Magahi: "🇮🇳",
    Maithili: "🇮🇳",
    Bhojpuri: "🇮🇳",
    Tamil: "🇮🇳",
    Telugu: "🇮🇳",
    Bengali: "🇮🇳",
    Rajasthani: "🇮🇳",
    Gujarati: "🇮🇳",
    Punjabi: "🇮🇳",
  };
  return icons[lang] || "🌐";
}

// ================== CHAT UI ==================
const chatScroll = document.getElementById("chatScroll");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("sendBtn");

function addBubble(html, type) {
  const wrap = document.createElement("div");
  wrap.className = `chat-bubble ${type}`;
  wrap.innerHTML = html;
  chatScroll.appendChild(wrap);
  chatScroll.scrollTop = chatScroll.scrollHeight;
  return wrap;
}

function escapeHTML(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

// ================== LOADING BUBBLE ==================
function addLoading() {
  const loading = document.createElement("div");
  loading.classList.add("chat-bubble", "bot", "loading-bubble");
  loading.innerHTML = `
    <div class="loading-dots">
      <span></span><span></span><span></span>
    </div>`;
  chatScroll.appendChild(loading);
  chatScroll.scrollTop = chatScroll.scrollHeight;
  return loading;
}

// ================== SEND QUESTION ==================
function sendQuestion() {
  stopTTS();
  const q = questionInput.value.trim();
  if (!q) return;
  addBubble(escapeHTML(q), "user");
  questionInput.value = "";
  getAnswer(q, selectedLanguage);
}

sendBtn.addEventListener("click", sendQuestion);
questionInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    sendQuestion();
  }
});

// ================== GEMINI CORE ==================
async function getAnswer(question, language) {
  const loader = addLoading();

  try {
    const resp = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": geminiAPIKey,
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: question }] }],
          system_instruction: {
            role: "system",
            parts: [
              { text: `Always answer in ${language}. Use simple words.` },
            ],
          },
        }),
      }
    );

    const data = await resp.json();
    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "Answer not available.";
    loader.remove();
    addBubble(answer.replace(/\n/g, "<br>"), "bot");

    // --- TTS ---
    if ("speechSynthesis" in window) {
      stopTTS();
      lastUtter = new SpeechSynthesisUtterance(answer);
      lastUtter.lang = getLangCode(language);
      speechSynthesis.speak(lastUtter);
    }

    // --- Media ---
    fetchDiagramImage(question).then((imgURL) => {
      if (imgURL)
        addBubble(
          `<strong>🖼️ Diagram:</strong><br><img src="${imgURL}" style="max-width:100%;border-radius:10px;margin-top:8px;">`,
          "bot"
        );
    });

    fetchPptPdfLinks(question).then((links) => {
      if (links.length) {
        const html =
          `<div><strong>📂 PPT/PDF:</strong></div>` +
          links
            .map(
              (l) =>
                `<a href="${l.link}" target="_blank">🔗 ${escapeHTML(
                  l.title
                )}</a>`
            )
            .join("<br>");
        addBubble(html, "bot");
      }
    });

    fetchYouTubeVideo(question, language).then((videoId) => {
      if (videoId) {
        const uniqueId = "ytplayer_" + Date.now();
        addBubble(
          `<strong>🎥 Video:</strong><br><div id="${uniqueId}"></div>`,
          "bot"
        );
        createYouTubePlayer(videoId, uniqueId);
      }
    });
  } catch (err) {
    console.error(err);
    loader.remove();
    addBubble("⚠️ Error fetching answer.", "bot");
  }
}

// ================== MEDIA HELPERS ==================
async function fetchDiagramImage(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query + " diagram"
    )}&searchType=image&num=1&safe=active&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.items?.[0]?.link || null;
  } catch {
    return null;
  }
}
async function fetchPptPdfLinks(query) {
  try {
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query + " (filetype:ppt OR filetype:pdf)"
    )}&num=3&safe=active&key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}`;
    const res = await fetch(url);
    const data = await res.json();
    return (data?.items || [])
      .slice(0, 3)
      .map((i) => ({ title: i.title, link: i.link }));
  } catch {
    return [];
  }
}
async function fetchYouTubeVideo(query, language) {
  try {
    const searchQuery = `${query} ${language} explanation`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDuration=medium&maxResults=1&q=${encodeURIComponent(
      searchQuery
    )}&key=${YOUTUBE_API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    return data?.items?.[0]?.id?.videoId || null;
  } catch {
    return null;
  }
}

// ================== YouTube IFrame API ==================
let ytApiLoaded = false;
function loadYouTubeIframeAPI() {
  if (!ytApiLoaded) {
    ytApiLoaded = true;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }
}
loadYouTubeIframeAPI();

function createYouTubePlayer(videoId, containerId) {
  new YT.Player(containerId, {
    height: "315",
    width: "100%",
    videoId,
    playerVars: { rel: 0, modestbranding: 1, controls: 1 },
    events: { onStateChange: onYtPlayerStateChange },
  });
}

function onYtPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) speechSynthesis.cancel();
}

// ================== VOICE INPUT ==================
function startVoiceInput() {
  stopTTS();
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    alert("Voice input not supported");
    return;
  }
  const recognition = new SR();
  recognition.lang = getLangCode(selectedLanguage);
  recognition.onresult = (e) => {
    questionInput.value +=
      (questionInput.value ? " " : "") + e.results[0][0].transcript;
  };
  recognition.start();
}

// ================== IMAGE OCR ==================
function captureImage() {
  stopTTS();
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const text = await extractTextFromImage(reader.result);
      questionInput.value += (questionInput.value ? "\n" : "") + text;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
async function extractTextFromImage(base64Image) {
  try {
    const { createWorker } = Tesseract;
    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const {
      data: { text },
    } = await worker.recognize(base64Image);
    await worker.terminate();
    return text;
  } catch {
    return "Could not extract text.";
  }
}

// ================== STOP TTS ON UI CLICK ==================
document.addEventListener("click", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (
    ["button", "select", "a", "input", "img", "iframe", "question"].includes(
      tag
    )
  )
    stopTTS();
});
