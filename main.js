/*
// edu_zone_updated.js

const geminiAPIKey = "AIzaSyDmGOBxL9RZ31OCrNIUG4YhWfW_rJogWY0";

// --- Auth Handling ---
function toggleAuth(section) {
  document.getElementById('registerSection').style.display = section === 'register' ? 'block' : 'none';
  document.getElementById('loginSection').style.display = section === 'login' ? 'block' : 'none';
}

function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  if (!name || !email || !password) return alert("Fill all fields.");
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.email === email)) return alert("User already exists.");
  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Registered! Please login.");
  toggleAuth('login');
}

function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'block';
  } else {
    alert("Wrong email or password.");
  }
}

// --- Gemini API ---
async function fetchAnswerFromGemini(question, language) {
  const prompt = `Answer the following question strictly in ${language}. Do not use any other language:\n${question}`;
  const shortPrompt = `Now, summarize the above answer into 3-5 short bullet points using ${language} only.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Answer not available.";

  const summaryResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n${answer}\n${shortPrompt}` }] }] })
    }
  );
  const summaryData = await summaryResponse.json();
  const shortNotes = summaryData.candidates?.[0]?.content?.parts?.[0]?.text || "Short notes not available.";
  return { answer, shortNotes };
}

function getLangCode(lang) {
  const codes = {
    English: 'en-US',
    Hindi: 'hi-IN',
    Bhojpuri: 'hi-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Bengali: 'bn-IN'
  };
  return codes[lang] || 'en-US';
}

async function getAnswer() {
  const question = document.getElementById('question').value;
  const language = document.getElementById('language').value;
  const responseText = document.getElementById('responseText');
  const shortNotesText = document.getElementById('shortNotesText');
  if (!question) return alert("Please enter your question.");
  responseText.innerText = "Loading answer...";
  shortNotesText.innerText = "";

  try {
    const { answer, shortNotes } = await fetchAnswerFromGemini(question, language);
    responseText.innerText = answer;
    shortNotesText.innerText = shortNotes;

    speechSynthesis.cancel(); // 🛑 Stop old speech
    const utter = new SpeechSynthesisUtterance(answer);
    utter.lang = getLangCode(language);
    speechSynthesis.speak(utter);

    showTextAsVideo(answer);
  } catch (error) {
    responseText.innerText = "Error fetching answer.";
    console.error("Gemini API Error:", error);
  }
}

// --- Video Style Display ---
function showTextAsVideo(text) {
  const canvas = document.getElementById("videoCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 220, canvas.width, 80);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  const lines = wrapText(ctx, text, 550);
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 250 + i * 22);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
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

async function extractTextFromImage(base64Image) {
  return "Image text extraction placeholder (OCR integration needed)";
}

// --- Dark Mode ---
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
*/
// edu_zone_updated.js

const geminiAPIKey = "AIzaSyDmGOBxL9RZ31OCrNIUG4YhWfW_rJogWY0";

// --- Auth Handling ---
function toggleAuth(section) {
  document.getElementById('registerSection').style.display = section === 'register' ? 'block' : 'none';
  document.getElementById('loginSection').style.display = section === 'login' ? 'block' : 'none';
}

function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  if (!name || !email || !password) return alert("Fill all fields.");
  let users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.email === email)) return alert("User already exists.");
  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert("Registered! Please login.");
  toggleAuth('login');
}

function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  let users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'block';
  } else {
    alert("Wrong email or password.");
  }
}

// --- Gemini API ---
async function fetchAnswerFromGemini(question, language) {
  const prompt = `Answer the following question strictly in ${language}. Do not use any other language:\n${question}`;
  const shortPrompt = `Now, summarize the above answer into 3-5 short bullet points using ${language} only.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    }
  );
  const data = await response.json();
  const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Answer not available.";

  const summaryResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: `${prompt}\n${answer}\n${shortPrompt}` }] }] })
    }
  );
  const summaryData = await summaryResponse.json();
  const shortNotes = summaryData.candidates?.[0]?.content?.parts?.[0]?.text || "Short notes not available.";
  return { answer, shortNotes };
}

function getLangCode(lang) {
  const codes = {
    English: 'en-US',
    Hindi: 'hi-IN',
    Bhojpuri: 'hi-IN',
    Tamil: 'ta-IN',
    Telugu: 'te-IN',
    Bengali: 'bn-IN'
  };
  return codes[lang] || 'en-US';
}

async function getAnswer() {
  const question = document.getElementById('question').value;
  const language = document.getElementById('language').value;
  const responseText = document.getElementById('responseText');
  const shortNotesText = document.getElementById('shortNotesText');
  if (!question) return alert("Please enter your question.");
  responseText.innerText = "Loading answer...";
  shortNotesText.innerText = "";

  try {
    const { answer, shortNotes } = await fetchAnswerFromGemini(question, language);
    responseText.innerText = answer;
    shortNotesText.innerText = shortNotes;

    speechSynthesis.cancel(); // 🛑 Stop old speech
    const utter = new SpeechSynthesisUtterance(answer);
    utter.lang = getLangCode(language);
    speechSynthesis.speak(utter);

    showTextAsVideo(answer);
  } catch (error) {
    responseText.innerText = "Error fetching answer.";
    console.error("Gemini API Error:", error);
  }
}

// --- Video Style Display ---
function showTextAsVideo(text) {
  const canvas = document.getElementById("videoCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  canvas.style.display = "block";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
  ctx.fillRect(0, 220, canvas.width, 80);
  ctx.font = "20px Arial";
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";

  const lines = wrapText(ctx, text, 550);
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, 250 + i * 22);
  });
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(line);
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line);
  return lines;
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

// --- OCR Integration (Tesseract.js v5) ---
async function extractTextFromImage(base64Image) {
  try {
    const worker = Tesseract.createWorker();
    await worker.load();
    await worker.loadLanguage('eng'); // change to 'hin' for Hindi OCR
    await worker.initialize('eng');
    const { data: { text } } = await worker.recognize(base64Image);
    await worker.terminate();
    return text;
  } catch (error) {
    console.error("OCR Error:", error);
    return "Could not extract text from image.";
  }
}

// --- Dark Mode ---
function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
}
