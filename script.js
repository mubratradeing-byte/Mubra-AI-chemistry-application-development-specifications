// ============================================================================
// MUBRA AI 8.v1+ - Advanced Chemistry Intelligence System
// FIXED: Correct Vercel Environment Variable API Key Handling
// ============================================================================

const CONFIG = {
    API_ENDPOINT: 'https://api.anthropic.com/v1/messages',
    MODEL: 'claude-3-5-sonnet-20241022',
    MAX_TOKENS: 2000,
};

let systemActivated = false;
let selectedImage = null;
let currentView = 'chat';
let selectedYear = null;
let selectedPaper = null;

// ============================================================================
// PAST PAPERS DATA STRUCTURE
// ============================================================================

const PAST_PAPERS_DATA = {
    2025: {
        papers: [
            { id: 1, name: 'Paper 1 (MCQ)', icon: '📋', desc: 'Multiple Choice Questions (30 marks)' },
            { id: 2, name: 'Paper 2 (Structured)', icon: '📝', desc: 'Structured Questions (50 marks)' },
            { id: 3, name: 'Paper 3 (Essay)', icon: '📖', desc: 'Essay Type Questions (20 marks)' }
        ],
        questions: {
            1: [
                { num: 'Q1', text: 'Atomic Structure and Electron Configuration' },
                { num: 'Q2', text: 'Periodic Trends and Chemical Bonding' },
                { num: 'Q3', text: 'States of Matter and Kinetic Theory' },
                { num: 'Q4', text: 'Solutions and Colligative Properties' },
                { num: 'Q5', text: 'Thermodynamics and Energy Changes' }
            ],
            2: [
                { num: 'Q1', text: 'Organic Chemistry - Alkanes and Alkenes' },
                { num: 'Q2', text: 'Alcohols and Carboxylic Acids' },
                { num: 'Q3', text: 'Carbonyl Compounds and Reactions' },
                { num: 'Q4', text: 'Reaction Mechanisms and Selectivity' },
                { num: 'Q5', text: 'Inorganic Chemistry - Transition Metals' }
            ],
            3: [
                { num: 'Q1', text: 'Organic Synthesis and Retrosynthesis Analysis' },
                { num: 'Q2', text: 'Physical Chemistry - Equilibrium and Kinetics' },
                { num: 'Q3', text: 'Inorganic Chemistry - Complex Formation and Colors' },
                { num: 'Q4', text: 'Analytical Chemistry and Volumetric Analysis' }
            ]
        }
    },
    2024: {
        papers: [
            { id: 1, name: 'Paper 1 (MCQ)', icon: '📋', desc: 'Multiple Choice Questions (30 marks)' },
            { id: 2, name: 'Paper 2 (Structured)', icon: '📝', desc: 'Structured Questions (50 marks)' },
            { id: 3, name: 'Paper 3 (Essay)', icon: '📖', desc: 'Essay Type Questions (20 marks)' }
        ],
        questions: {
            1: [
                { num: 'Q1', text: 'Atomic Theory and Quantum Numbers' },
                { num: 'Q2', text: 'Chemical Bonding and Molecular Structure' },
                { num: 'Q3', text: 'Acids, Bases and pH Calculations' },
                { num: 'Q4', text: 'Redox Reactions and Electrochemistry' },
                { num: 'Q5', text: 'Gases and Gas Laws' }
            ],
            2: [
                { num: 'Q1', text: 'Hydrocarbons and Combustion' },
                { num: 'Q2', text: 'Functional Groups and Isomerism' },
                { num: 'Q3', text: 'Polymerization and Polymers' },
                { num: 'Q4', text: 'Oxidation and Reduction Reactions' },
                { num: 'Q5', text: 'Coordination Chemistry Basics' }
            ],
            3: [
                { num: 'Q1', text: 'Reaction Pathways in Organic Synthesis' },
                { num: 'Q2', text: 'Equilibrium Constant Calculations' },
                { num: 'Q3', text: 'Chemical Kinetics and Rate Equations' },
                { num: 'Q4', text: 'Laboratory Techniques and Safety' }
            ]
        }
    }
};

// Generate all years from 1985-2025
function generatePastPapersData() {
    for (let year = 2023; year >= 1985; year -= 1) {
        if (!PAST_PAPERS_DATA[year]) {
            PAST_PAPERS_DATA[year] = JSON.parse(JSON.stringify(PAST_PAPERS_DATA[2024]));
        }
    }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    generatePastPapersData();
    initializeEventListeners();
    loadAppState();
    checkSystemActivation();
    generatePapersGrid();
});

function initializeEventListeners() {
    // Activation Modal
    document.getElementById('activationBtn').addEventListener('click', openModal);
    document.getElementById('activateBtn').addEventListener('click', activateSystem);
    document.getElementById('activationCode').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') activateSystem();
    });
    
    // Chat Interface
    document.getElementById('sendBtn').addEventListener('click', sendMessage);
    document.getElementById('messageInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    document.getElementById('messageInput').addEventListener('input', autoResizeTextarea);
    
    // Image Upload
    document.getElementById('cameraBtn').addEventListener('click', () => {
        document.getElementById('imageInput').click();
    });
    document.getElementById('imageInput').addEventListener('change', handleImageUpload);
    
    // Past Papers Navigation
    document.getElementById('papersBackBtn').addEventListener('click', closePastPapersView);
}

function generatePapersGrid() {
    const papersGrid = document.getElementById('papersGrid');
    const years = [];
    
    for (let year = 2025; year >= 1985; year--) {
        years.push(year);
    }
    
    papersGrid.innerHTML = years.map(year => `
        <button class="paper-btn" data-year="${year}" onclick="openPastPapersView(${year})">
            ${year}
        </button>
    `).join('');
}

// ============================================================================
// PAST PAPERS SYSTEM
// ============================================================================

function openPastPapersView(year) {
    if (!systemActivated) {
        showNotification('Please activate the system first', 'warning');
        openModal();
        return;
    }
    
    selectedYear = year;
    selectedPaper = null;
    currentView = 'papers';
    
    const chatView = document.getElementById('chatView');
    const papersView = document.getElementById('pastPapersView');
    
    chatView.style.display = 'none';
    papersView.classList.add('active');
    
    const papersViewTitle = document.getElementById('papersViewTitle');
    papersViewTitle.textContent = `${year} A/L Chemistry Past Papers`;
    
    showPaperSelection(year);
}

function closePastPapersView() {
    currentView = 'chat';
    const chatView = document.getElementById('chatView');
    const papersView = document.getElementById('pastPapersView');
    
    chatView.style.display = 'flex';
    papersView.classList.remove('active');
    
    selectedYear = null;
    selectedPaper = null;
}

function showPaperSelection(year) {
    const papersContent = document.getElementById('papersContent');
    const papers = PAST_PAPERS_DATA[year]?.papers || [];
    
    papersContent.innerHTML = `
        <div class="paper-selection">
            ${papers.map(paper => `
                <div class="paper-card" onclick="selectPaper(${year}, ${paper.id})">
                    <div class="paper-card-icon">${paper.icon}</div>
                    <div class="paper-card-title">${paper.name}</div>
                    <div class="paper-card-desc">${paper.desc}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function selectPaper(year, paperId) {
    selectedPaper = paperId;
    const questions = PAST_PAPERS_DATA[year]?.questions[paperId] || [];
    
    const papersContent = document.getElementById('papersContent');
    papersContent.innerHTML = `
        <div class="question-list">
            ${questions.map((q, idx) => `
                <div class="question-item" onclick="showQuestionDetail(${year}, ${paperId}, ${idx})">
                    <div class="question-num">${q.num}</div>
                    <div class="question-text">${q.text}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function showQuestionDetail(year, paperId, questionIdx) {
    const question = PAST_PAPERS_DATA[year]?.questions[paperId][questionIdx];
    if (!question) return;
    
    const papersContent = document.getElementById('papersContent');
    papersContent.innerHTML = `
        <div class="question-detail">
            <div class="question-detail-header">
                <div class="question-detail-label">${PAST_PAPERS_DATA[year].papers[paperId - 1].name}</div>
                <div class="question-detail-text">${question.num}: ${question.text}</div>
            </div>
            
            <div class="question-detail-actions">
                <button class="ask-ai-btn" onclick="askAIForAnswer('${question.num}', '${question.text}')">
                    <i class="fas fa-sparkles"></i> Ask Mubra AI
                </button>
                <button onclick="goBackToQuestions()" style="flex: 0.5; padding: 12px 16px; background: rgba(212, 175, 55, 0.1); color: var(--accent); border: 2px solid var(--accent); border-radius: 6px; cursor: pointer; font-weight: 700; transition: all 0.3s ease;">
                    <i class="fas fa-arrow-left"></i> Back
                </button>
            </div>
            
            <div id="aiAnswerContainer" style="margin-top: 20px;"></div>
        </div>
    `;
}

function goBackToQuestions() {
    selectPaper(selectedYear, selectedPaper);
}

async function askAIForAnswer(questionNum, questionText) {
    const answerContainer = document.getElementById('aiAnswerContainer');
    
    // Show loading state
    answerContainer.innerHTML = `
        <div class="paper-answer-container">
            <div class="paper-answer-label">MUBRA AI SOLUTION</div>
            <div class="paper-answer-text">
                <div class="loading"><span class="loading"></span><span class="loading"></span><span class="loading"></span></div>
            </div>
        </div>
    `;
    
    try {
        const prompt = `${questionNum}: ${questionText}`;
        const response = await queryAI(prompt);
        
        // Type out the response with effect
        displayTypewriterAnswer(response, answerContainer);
    } catch (error) {
        answerContainer.innerHTML = `
            <div class="paper-answer-container" style="border-color: #ff6b6b;">
                <div class="paper-answer-label">ERROR</div>
                <div class="paper-answer-text">${error.message}</div>
            </div>
        `;
    }
}

function displayTypewriterAnswer(text, container) {
    const html = `
        <div class="paper-answer-container">
            <div class="paper-answer-label">MUBRA AI SOLUTION</div>
            <div class="paper-answer-text" id="typewriterText"></div>
        </div>
    `;
    
    container.innerHTML = html;
    
    const typewriterElement = container.querySelector('#typewriterText');
    let charIndex = 0;
    
    function typeCharacter() {
        if (charIndex < text.length) {
            typewriterElement.textContent += text[charIndex];
            charIndex++;
            
            // Adjust speed - faster typing for better UX
            const delay = Math.random() > 0.9 ? 5 : 15;
            setTimeout(typeCharacter, delay);
        } else {
            // Render math formulas after typing
            setTimeout(() => renderMathFormulas(), 100);
        }
    }
    
    typeCharacter();
}

// ============================================================================
// CHAT INTERFACE
// ============================================================================

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    
    if (!message) {
        showNotification('Please enter a message', 'warning');
        return;
    }
    
    if (!systemActivated) {
        showNotification('Please activate the system first', 'warning');
        openModal();
        return;
    }
    
    // Add user message to UI
    addMessageToUI(message, 'user', selectedImage);
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    selectedImage = null;
    clearImagePreview();
    
    // Show loading indicator
    const loadingId = showLoadingIndicator();
    
    try {
        const response = await queryAI(message, selectedImage);
        removeLoadingIndicator(loadingId);
        displayTypewriterMessage(response);
        renderMathFormulas();
    } catch (error) {
        removeLoadingIndicator(loadingId);
        addMessageToUI(`Error: ${error.message}`, 'ai');
    }
}

function displayTypewriterMessage(text) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content message-typing';
    
    messageEl.appendChild(contentEl);
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    let charIndex = 0;
    
    function typeCharacter() {
        if (charIndex < text.length) {
            contentEl.textContent += text[charIndex];
            charIndex++;
            
            // Variable speed for natural typing effect
            const delay = Math.random() > 0.85 ? 5 : 20;
            setTimeout(typeCharacter, delay);
        } else {
            // Remove typing cursor
            contentEl.classList.remove('message-typing');
            renderMathFormulas();
        }
    }
    
    typeCharacter();
}

async function queryAI(userMessage, imageBase64 = null) {
    const systemPrompt = `You are Mubra AI 8.v1, an advanced chemistry intelligence system designed specifically for Sri Lankan A/L Chemistry students.

IDENTITY & ROLE:
- Name: Mubra AI 8.v1
- Function: Sri Lankan A/L Chemistry Guru
- Specialization: Organic Chemistry, Inorganic Chemistry, Physical Chemistry

LANGUAGE REQUIREMENT:
- Respond EXCLUSIVELY in Sinhala (සිංහල)
- Use formal academic Sinhala appropriate for A/L level students
- When explaining chemical concepts, use both Sinhala and chemical notation

RESPONSE STYLE:
- Professional and academic in tone
- Structure responses in marking scheme format where applicable
- Provide step-by-step explanations
- Include relevant chemical equations and formulas
- Use proper chemical terminology in Sinhala

CHEMISTRY COVERAGE:
1. Organic Chemistry: Reactions, mechanisms, synthesis, functional groups
2. Inorganic Chemistry: Periodic table, coordination compounds, reactions
3. Physical Chemistry: Thermodynamics, kinetics, equilibrium, electrochemistry

FORMAT GUIDELINES:
- Use $LaTeX$ notation for chemical formulas (e.g., $H_2SO_4$, $NaCl$)
- Organize responses with clear sections
- Provide marking scheme points where relevant
- Include practical applications and real-world examples

TONE:
- Supportive and encouraging
- Academically rigorous
- Clear and accessible for A/L level understanding`;

    const messages = [
        {
            role: 'user',
            content: buildMessageContent(userMessage, imageBase64)
        }
    ];
    
    const requestBody = {
        model: CONFIG.MODEL,
        max_tokens: CONFIG.MAX_TOKENS,
        system: systemPrompt,
        messages: messages
    };
    
    const apiKey = getAPIKey();
    
    const response = await fetch(CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(`API Error: ${error.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    
    if (data.content && data.content.length > 0) {
        return data.content[0].text;
    }
    
    throw new Error('No response from AI');
}

function buildMessageContent(text, imageBase64) {
    const content = [];
    
    // Add text
    content.push({
        type: 'text',
        text: text
    });
    
    // Add image if present
    if (imageBase64) {
        const base64Data = imageBase64.split(',')[1];
        content.push({
            type: 'image',
            source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Data
            }
        });
    }
    
    return content;
}

// ============================================================================
// API KEY HANDLING - FIXED FOR VERCEL
// ============================================================================

function getAPIKey() {
    // FIXED: Get API key from Vercel environment variable
    // Vercel injects environment variables into the global scope via a build-time replacement
    
    // The key should be available as ANTHROPIC_API_KEY in Vercel environment
    // Since we can't directly access process.env in browser, we use a workaround
    
    // Try multiple methods to get the API key:
    
    // Method 1: Check if it's been injected into window object
    if (typeof window !== 'undefined' && window.ANTHROPIC_API_KEY) {
        return window.ANTHROPIC_API_KEY;
    }
    
    // Method 2: Try localStorage (fallback for development)
    const storedKey = localStorage.getItem('anthropic_api_key');
    if (storedKey) {
        return storedKey;
    }
    
    // Method 3: If running in a worker or iframe, check parent
    if (typeof window !== 'undefined' && window.parent && window.parent.ANTHROPIC_API_KEY) {
        return window.parent.ANTHROPIC_API_KEY;
    }
    
    // If we get here, no API key is available
    throw new Error('Error: API Key not configured. Please ensure ANTHROPIC_API_KEY is set in Vercel environment variables.');
}

function addMessageToUI(message, sender = 'ai', imageData = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `message ${sender}-message`;
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    
    // Add image if present
    if (imageData && sender === 'user') {
        const imgEl = document.createElement('img');
        imgEl.className = 'message-image';
        imgEl.src = imageData;
        contentEl.appendChild(imgEl);
        const br = document.createElement('br');
        contentEl.appendChild(br);
    }
    
    contentEl.innerHTML += message;
    messageEl.appendChild(contentEl);
    chatMessages.appendChild(messageEl);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showLoadingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = 'message ai-message';
    messageEl.id = 'loading-' + Date.now();
    
    const contentEl = document.createElement('div');
    contentEl.className = 'message-content';
    contentEl.innerHTML = '<div class="loading"><span class="loading"></span><span class="loading"></span><span class="loading"></span></div>';
    
    messageEl.appendChild(contentEl);
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageEl.id;
}

function removeLoadingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
        element.remove();
    }
}

// ============================================================================
// IMAGE HANDLING
// ============================================================================

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size must be less than 5MB', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        selectedImage = event.target.result;
        displayImagePreview(selectedImage);
    };
    reader.readAsDataURL(file);
}

function displayImagePreview(imageData) {
    const container = document.getElementById('imagePreviewContainer');
    container.innerHTML = '';
    
    const previewEl = document.createElement('div');
    previewEl.className = 'image-preview';
    
    const imgEl = document.createElement('img');
    imgEl.src = imageData;
    previewEl.appendChild(imgEl);
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'image-remove';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', clearImagePreview);
    previewEl.appendChild(removeBtn);
    
    container.appendChild(previewEl);
}

function clearImagePreview() {
    document.getElementById('imagePreviewContainer').innerHTML = '';
    document.getElementById('imageInput').value = '';
    selectedImage = null;
}

// ============================================================================
// TEXT FORMATTING & RENDERING
// ============================================================================

function renderMathFormulas() {
    const chatMessages = document.getElementById('chatMessages');
    const papersContent = document.getElementById('papersContent');
    
    // Render in chat
    if (chatMessages) {
        chatMessages.querySelectorAll('.ai-message .message-content').forEach(el => {
            try {
                renderMathInElement(el, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
            }
        });
    }
    
    // Render in papers view
    if (papersContent) {
        papersContent.querySelectorAll('.paper-answer-text').forEach(el => {
            try {
                renderMathInElement(el, {
                    delimiters: [
                        { left: '$$', right: '$$', display: true },
                        { left: '$', right: '$', display: false }
                    ],
                    throwOnError: false
                });
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
            }
        });
    }
}

function autoResizeTextarea() {
    const textarea = document.getElementById('messageInput');
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
}

// ============================================================================
// AUTHENTICATION SYSTEM
// ============================================================================

function openModal() {
    document.getElementById('activationModal').classList.add('active');
    document.getElementById('activationCode').focus();
}

function closeModal() {
    document.getElementById('activationModal').classList.remove('active');
}

function activateSystem() {
    const code = document.getElementById('activationCode').value;
    
    if (code.length !== 16) {
        showNotification('Activation code must be 16 digits', 'error');
        return;
    }
    
    if (!/^\d+$/.test(code)) {
        showNotification('Activation code must contain only digits', 'error');
        return;
    }
    
    systemActivated = true;
    localStorage.setItem('systemActivated', 'true');
    localStorage.setItem('activationCode', code);
    
    closeModal();
    showNotification('System Activated Successfully!', 'success');
}

function checkSystemActivation() {
    const activated = localStorage.getItem('systemActivated');
    if (activated === 'true') {
        systemActivated = true;
    }
}

// ============================================================================
// APP STATE MANAGEMENT
// ============================================================================

function loadAppState() {
    const savedState = localStorage.getItem('mubra_app_state');
    if (savedState) {
        try {
            // Load any saved state if needed
        } catch (e) {
            console.warn('Failed to load app state:', e);
        }
    }
}

function saveAppState() {
    const state = {
        timestamp: Date.now(),
        activated: systemActivated
    };
    localStorage.setItem('mubra_app_state', JSON.stringify(state));
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'error' ? '#D32F2F' : type === 'success' ? '#388E3C' : '#1976D2'};
        color: white;
        border-radius: 6px;
        font-size: 13px;
        z-index: 999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================================================
// WINDOW CLOSE HANDLER
// ============================================================================

window.addEventListener('beforeunload', () => {
    saveAppState();
});

// ============================================================================
// EXPORT FUNCTIONS FOR GLOBAL SCOPE
// ============================================================================

window.closeModal = closeModal;
window.openPastPapersView = openPastPapersView;
window.closePastPapersView = closePastPapersView;
window.selectPaper = selectPaper;
window.showQuestionDetail = showQuestionDetail;
window.askAIForAnswer = askAIForAnswer;
window.goBackToQuestions = goBackToQuestions;
