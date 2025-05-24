console.log('Script starting...');

// Debug mode setup
window.debug = {
    enabled: false,
    enable: function() {
        this.enabled = true;
        console.log('Debug mode enabled');
    },
    disable: function() {
        this.enabled = false;
        console.log('Debug mode disabled');
    },
    log: function(...args) {
        if (this.enabled) {
            console.log(...args);
        }
    },
    error: function(...args) {
        if (this.enabled) {
            console.error(...args);
        }
    }
};

// Add error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    window.debug.error('Error: ' + msg + '\nURL: ' + url + '\nLine: ' + lineNo + '\nColumn: ' + columnNo + '\nError object: ' + JSON.stringify(error));
    return false;
};

let currentQuestionIndex = 0;
let score = 0;
let quizData = null;
let incorrectQuestions = []; // Track incorrect questions
let isReviewMode = false; // Track if we're in review mode

// Storage keys
const STORAGE_KEYS = {
    CURRENT_QUIZ: 'currentQuiz',
    INCORRECT_QUESTIONS: 'incorrectQuestions',
    REVIEW_MODE: 'reviewMode',
    CURRENT_QUESTION: 'currentQuestion',
    SCORE: 'score'
};

// DOM Elements
const topicSelection = document.getElementById('topic-selection');
const quizScreen = document.getElementById('quiz-screen');
const topicsList = document.getElementById('topics-list');
const quizTitle = document.getElementById('quiz-title');
const quizDescription = document.getElementById('quiz-description');
const questionText = document.getElementById('question-text');
const answerText = document.getElementById('answer-text');
const checkAnswerBtn = document.getElementById('check-answer');
const nextCardBtn = document.getElementById('next-card');
const scoreDisplay = document.getElementById('score');
const progressFill = document.querySelector('.progress-fill');
const currentQuestionDisplay = document.getElementById('current-question');
const totalQuestionsDisplay = document.getElementById('total-questions');
const finalScoreScreen = document.getElementById('final-score-screen');
const finalScoreDisplay = document.getElementById('final-score');
const totalScoreDisplay = document.getElementById('total-score');
const percentageDisplay = document.getElementById('percentage');
const restartQuizBtn = document.getElementById('restart-quiz');
const backToTopicsBtn = document.getElementById('back-to-topics');
const backToTopicsFinalBtn = document.getElementById('back-to-topics-final');

// List of known quiz files
const quizFiles = [
    'questions.json',
    'spanish_questions.json',
    'history_unit8.json',
    'HistoryComprehensiveTest.json'
];

// Save state to localStorage
function saveState() {
    window.debug.log('Attempting to save state...');
    if (!quizData) {
        window.debug.log('No quiz data to save');
        return;
    }
    
    try {
        const state = {
            quizFile: quizData.file,
            incorrectQuestions: incorrectQuestions,
            isReviewMode: isReviewMode,
            currentQuestionIndex: currentQuestionIndex,
            score: score
        };
        
        window.debug.log('Saving state:', state);
        localStorage.setItem(STORAGE_KEYS.CURRENT_QUIZ, JSON.stringify(state));
        window.debug.log('State saved successfully');
    } catch (error) {
        window.debug.error('Error saving state:', error);
    }
}

// Load state from localStorage
function loadState() {
    window.debug.log('Attempting to load state...');
    try {
        const savedState = localStorage.getItem(STORAGE_KEYS.CURRENT_QUIZ);
        window.debug.log('Loading saved state:', savedState);
        
        if (!savedState) {
            window.debug.log('No saved state found');
            return false;
        }
        
        const state = JSON.parse(savedState);
        window.debug.log('Parsed state:', state);
        
        // Load the quiz first
        return loadQuiz(state.quizFile).then(() => {
            incorrectQuestions = state.incorrectQuestions;
            isReviewMode = state.isReviewMode;
            currentQuestionIndex = state.currentQuestionIndex;
            score = state.score;
            
            window.debug.log('Restored state:', {
                incorrectQuestions,
                isReviewMode,
                currentQuestionIndex,
                score
            });
            
            // Update UI
            updateScore();
            updateProgress();
            
            if (isReviewMode) {
                startReviewMode();
            } else {
                showQuestion();
            }
            
            return true;
        }).catch(error => {
            window.debug.error('Error loading quiz:', error);
            return false;
        });
    } catch (error) {
        window.debug.error('Error loading state:', error);
        return false;
    }
}

// Clear saved state
function clearSavedState() {
    window.debug.log('Clearing saved state');
    localStorage.removeItem(STORAGE_KEYS.CURRENT_QUIZ);
}

// Load and display available quizzes
async function loadQuizzes() {
    try {
        const availableQuizzes = [];
        
        // Try to load each quiz file
        for (const file of quizFiles) {
            try {
                const response = await fetch(file);
                if (response.ok) {
                    const quizData = await response.json();
                    // Verify this is a quiz file by checking for required fields
                    if (quizData.title && quizData.description && quizData.questions) {
                        availableQuizzes.push({
                            file: file,
                            title: quizData.title,
                            description: quizData.description
                        });
                    }
                }
            } catch (error) {
                console.warn(`Could not load quiz file ${file}:`, error);
            }
        }

        if (availableQuizzes.length === 0) {
            topicsList.innerHTML = '<p class="error">No quiz files found. Please add some quiz JSON files to the repository.</p>';
            return;
        }

        displayTopics(availableQuizzes);
    } catch (error) {
        console.error('Error loading quizzes:', error);
        topicsList.innerHTML = '<p class="error">Error loading quizzes. Please try again later.</p>';
    }
}

// Display available topics
function displayTopics(quizzes) {
    topicsList.innerHTML = quizzes.map(quiz => `
        <div class="topic-card" data-quiz-file="${quiz.file}">
            <h2>${quiz.title}</h2>
            <p>${quiz.description}</p>
        </div>
    `).join('');

    // Add click event listeners to topic cards
    document.querySelectorAll('.topic-card').forEach(card => {
        card.addEventListener('click', () => {
            const quizFile = card.dataset.quizFile;
            loadQuiz(quizFile);
        });
    });
}

// Load a specific quiz
async function loadQuiz(quizFile) {
    try {
        const response = await fetch(quizFile);
        if (!response.ok) {
            throw new Error(`Failed to load quiz: ${response.statusText}`);
        }
        quizData = await response.json();
        quizData.file = quizFile; // Store the file name for state restoration
        
        // Update UI with quiz info
        quizTitle.textContent = quizData.title;
        quizDescription.textContent = quizData.description;
        totalQuestionsDisplay.textContent = quizData.questions.length;
        
        // Reset quiz state
        currentQuestionIndex = 0;
        score = 0;
        incorrectQuestions = [];
        isReviewMode = false;
        updateScore();
        updateProgress();
        
        // Show first question
        showQuestion();
        
        // Switch to quiz screen
        topicSelection.style.display = 'none';
        quizScreen.style.display = 'block';
        finalScoreScreen.style.display = 'none';
        
        return true;
    } catch (error) {
        console.error('Error loading quiz:', error);
        alert('Error loading quiz. Please try again later.');
        return false;
    }
}

// Show current question
function showQuestion() {
    const question = quizData.questions[currentQuestionIndex];
    questionText.textContent = question.question;
    
    // Clear previous options
    answerText.innerHTML = '';
    
    // Create radio buttons for each option
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'answer';
        radio.id = `option${index}`;
        radio.value = index;
        
        const label = document.createElement('label');
        label.htmlFor = `option${index}`;
        label.textContent = option;
        
        optionDiv.appendChild(radio);
        optionDiv.appendChild(label);
        answerText.appendChild(optionDiv);
    });
    
    // Reset button states
    checkAnswerBtn.style.display = 'block';
    nextCardBtn.style.display = 'none';
    currentQuestionDisplay.textContent = currentQuestionIndex + 1;
}

// Check answer
function checkAnswer() {
    const selectedOption = document.querySelector('input[name="answer"]:checked');
    if (!selectedOption) {
        alert('Please select an answer');
        return;
    }
    
    const selectedAnswer = parseInt(selectedOption.value);
    const question = quizData.questions[currentQuestionIndex];
    
    // Disable all radio buttons
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.disabled = true;
    });
    
    // Show correct/incorrect feedback
    const options = document.querySelectorAll('.option');
    options.forEach((option, index) => {
        if (index === question.answer) {
            option.style.backgroundColor = '#d4edda';
            option.style.borderColor = '#c3e6cb';
        } else if (index === selectedAnswer && selectedAnswer !== question.answer) {
            option.style.backgroundColor = '#f8d7da';
            option.style.borderColor = '#f5c6cb';
        }
    });
    
    // Update score if correct
    if (selectedAnswer === question.answer) {
        score++;
        updateScore();
    } else {
        // Add to incorrect questions if not in review mode
        if (!isReviewMode) {
            incorrectQuestions.push(currentQuestionIndex);
        }
    }
    
    // Show explanation
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.textContent = question.explanation;
    answerText.appendChild(explanationDiv);
    
    // Show next button
    checkAnswerBtn.style.display = 'none';
    nextCardBtn.style.display = 'block';
    
    // Save state after each answer
    saveState();
}

// Move to next question
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.questions.length) {
        showQuestion();
    } else {
        if (!isReviewMode && incorrectQuestions.length > 0) {
            showReviewPrompt();
        } else {
            showFinalScore();
        }
    }
    updateProgress();
}

// Show review mode prompt
function showReviewPrompt() {
    // Hide quiz elements
    questionText.style.display = 'none';
    answerText.style.display = 'none';
    checkAnswerBtn.style.display = 'none';
    nextCardBtn.style.display = 'none';
    
    // Create review prompt
    const reviewPrompt = document.createElement('div');
    reviewPrompt.className = 'review-prompt';
    reviewPrompt.innerHTML = `
        <h3>You missed ${incorrectQuestions.length} questions</h3>
        <p>Would you like to review the questions you missed?</p>
        <div class="review-buttons">
            <button id="start-review" class="btn">Start Review</button>
            <button id="skip-review" class="btn">Skip Review</button>
        </div>
    `;
    
    // Add to quiz screen
    quizScreen.appendChild(reviewPrompt);
    
    // Add event listeners
    document.getElementById('start-review').addEventListener('click', () => {
        reviewPrompt.remove();
        startReviewMode();
    });
    
    document.getElementById('skip-review').addEventListener('click', () => {
        reviewPrompt.remove();
        showFinalScore();
    });
}

// Start review mode with incorrect questions
function startReviewMode() {
    isReviewMode = true;
    currentQuestionIndex = 0;
    score = 0;
    updateScore();
    
    // Filter questions to only include incorrect ones
    quizData.questions = incorrectQuestions.map(index => quizData.questions[index]);
    incorrectQuestions = []; // Reset incorrect questions for review mode
    
    // Update UI for review mode
    quizTitle.textContent = `${quizData.title} - Review Mode`;
    quizDescription.textContent = 'Reviewing questions you missed';
    totalQuestionsDisplay.textContent = quizData.questions.length;
    
    // Restore quiz elements
    questionText.style.display = 'block';
    answerText.style.display = 'block';
    
    showQuestion();
    updateProgress();
}

// Update progress bar
function updateProgress() {
    const progress = (currentQuestionIndex / quizData.questions.length) * 100;
    progressFill.style.width = `${progress}%`;
}

// Update score display
function updateScore() {
    scoreDisplay.textContent = score;
}

// Show final score
function showFinalScore() {
    const percentage = Math.round((score / quizData.questions.length) * 100);
    finalScoreDisplay.textContent = score;
    totalScoreDisplay.textContent = quizData.questions.length;
    percentageDisplay.textContent = `${percentage}%`;
    
    // Add review mode status to final score screen
    const reviewStatus = document.createElement('p');
    reviewStatus.className = 'review-status';
    reviewStatus.textContent = isReviewMode ? 'Review Mode Complete!' : 'First Attempt Complete!';
    finalScoreScreen.insertBefore(reviewStatus, finalScoreScreen.firstChild);
    
    quizScreen.style.display = 'none';
    finalScoreScreen.style.display = 'block';
    
    // Clear saved state when quiz is completed
    clearSavedState();
}

// Reset quiz state
function resetQuizState() {
    currentQuestionIndex = 0;
    score = 0;
    incorrectQuestions = [];
    isReviewMode = false;
    updateScore();
    updateProgress();
}

// Event Listeners
checkAnswerBtn.addEventListener('click', checkAnswer);
nextCardBtn.addEventListener('click', nextQuestion);
restartQuizBtn.addEventListener('click', () => {
    resetQuizState();
    showQuestion();
    finalScoreScreen.style.display = 'none';
    quizScreen.style.display = 'block';
});

backToTopicsBtn.addEventListener('click', () => {
    console.log('Back to topics button clicked - clearing state');
    quizScreen.style.display = 'none';
    topicSelection.style.display = 'block';
    clearSavedState();
});

backToTopicsFinalBtn.addEventListener('click', () => {
    console.log('Back to topics final button clicked - clearing state');
    finalScoreScreen.style.display = 'none';
    topicSelection.style.display = 'block';
    clearSavedState();
});

// Initialize the app
async function initializeApp() {
    // Try to load saved state first
    const stateLoaded = await loadState();
    
    // If no saved state, load the topic selection
    if (!stateLoaded) {
        loadQuizzes();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.debug.log('DOM loaded, initializing app...');
    try {
        initializeApp();
    } catch (error) {
        window.debug.error('Error initializing app:', error);
    }
}); 