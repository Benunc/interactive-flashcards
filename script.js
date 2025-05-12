let currentQuestionIndex = 0;
let score = 0;
let quizData = null;

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

// List of known quiz files - add new files here
const quizFiles = [
    'questions.json',
    'spanish_questions.json',
    'algebra2_questions.json'
];

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

// Load specific quiz
async function loadQuiz(quizFile) {
    try {
        const response = await fetch(quizFile);
        quizData = await response.json();
        
        // Update quiz information
        quizTitle.textContent = quizData.title;
        quizDescription.textContent = quizData.description;
        totalQuestionsDisplay.textContent = quizData.totalQuestions;
        
        // Reset quiz state
        currentQuestionIndex = 0;
        score = 0;
        scoreDisplay.textContent = '0';
        
        // Show quiz screen
        topicSelection.style.display = 'none';
        quizScreen.style.display = 'block';
        finalScoreScreen.style.display = 'none';
        
        // Start the quiz
        displayCard();
    } catch (error) {
        console.error('Error loading quiz data:', error);
        questionText.textContent = 'Error loading quiz data. Please try again later.';
    }
}

function displayCard() {
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
    
    // Update progress
    const progress = ((currentQuestionIndex) / quizData.totalQuestions) * 100;
    progressFill.style.width = `${progress}%`;
    currentQuestionDisplay.textContent = currentQuestionIndex + 1;
    
    // Reset button states
    checkAnswerBtn.style.display = 'block';
    nextCardBtn.style.display = 'none';
}

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
        scoreDisplay.textContent = score;
    }
    
    // Show explanation
    const explanationDiv = document.createElement('div');
    explanationDiv.className = 'explanation';
    explanationDiv.textContent = question.explanation;
    answerText.appendChild(explanationDiv);
    
    // Show next button
    checkAnswerBtn.style.display = 'none';
    nextCardBtn.style.display = 'block';
}

function nextCard() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizData.totalQuestions) {
        displayCard();
    } else {
        showFinalScore();
    }
}

function showFinalScore() {
    const percentage = Math.round((score / quizData.totalQuestions) * 100);
    finalScoreDisplay.textContent = score;
    totalScoreDisplay.textContent = quizData.totalQuestions;
    percentageDisplay.textContent = percentage;
    finalScoreScreen.style.display = 'flex';
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    scoreDisplay.textContent = '0';
    finalScoreScreen.style.display = 'none';
    displayCard();
}

function backToTopics() {
    quizScreen.style.display = 'none';
    finalScoreScreen.style.display = 'none';
    topicSelection.style.display = 'block';
}

// Event Listeners
checkAnswerBtn.addEventListener('click', checkAnswer);
nextCardBtn.addEventListener('click', nextCard);
restartQuizBtn.addEventListener('click', restartQuiz);
backToTopicsBtn.addEventListener('click', backToTopics);
backToTopicsFinalBtn.addEventListener('click', backToTopics);

// Start the application
loadQuizzes(); 