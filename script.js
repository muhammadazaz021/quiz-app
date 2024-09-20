document.addEventListener('DOMContentLoaded', () => {
    const questionText = document.getElementById('question-text');
    const answerButtons = document.getElementById('answer-buttons');
    const nextButton = document.getElementById('next-button');
    const restartButton = document.getElementById('restart-button');

    let questions = [];
    let currentQuestionIndex = 0;

    async function fetchQuestions() {
        try {
            const response = await fetch('https://opentdb.com/api.php?amount=6&category=9&difficulty=easy&type=multiple');
            if (!response.ok) throw new Error('Network response was not ok.');
            const data = await response.json();
            questions = data.results.map(q => ({
                question: q.question,
                answers: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
                correct: q.correct_answer
            }));
            startGame();
        } catch (error) {
            console.error('Error fetching questions:', error);
            questionText.textContent = 'Failed to load quiz questions. Please try again later.';
            answerButtons.innerHTML = '';
            nextButton.classList.add('hide');
            restartButton.classList.remove('hide');
        }
    }

    function startGame() {
        currentQuestionIndex = 0;
        nextButton.classList.add('hide');
        restartButton.classList.add('hide');
        showQuestion(questions[currentQuestionIndex]);
    }

    function showQuestion(question) {
        questionText.innerHTML = question.question;
        answerButtons.innerHTML = '';
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerHTML = answer;
            button.classList.add('answer-button');
            button.addEventListener('click', () => selectAnswer(answer));
            answerButtons.appendChild(button);
        });
    }

    function selectAnswer(selectedAnswer) {
        const correctAnswer = questions[currentQuestionIndex].correct;
        answerButtons.querySelectorAll('button').forEach(button => {
            const answer = button.textContent.trim();
            if (answer === correctAnswer) {
                button.classList.add('correct');
            } else if (answer === selectedAnswer) {
                button.classList.add('incorrect');
            }
            button.classList.add('disabled');
        });

        nextButton.classList.remove('hide');
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            showQuestion(questions[currentQuestionIndex]);
            nextButton.classList.add('hide');
        } else {
            displayResults();
        }
        saveProgress();
    });

    function displayResults() {
        questionText.innerHTML = 'Quiz Completed! Check the console for results.';
        answerButtons.innerHTML = '';
        nextButton.classList.add('hide');
        restartButton.classList.remove('hide');
        console.log('Quiz completed. Review your answers in the console.');
    }

    function saveProgress() {
        const progress = {
            currentQuestionIndex,
            questions
        };
        localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    function loadProgress() {
        const savedProgress = JSON.parse(localStorage.getItem('quizProgress'));
        if (savedProgress) {
            currentQuestionIndex = savedProgress.currentQuestionIndex;
            questions = savedProgress.questions;
        } else {
            currentQuestionIndex = 0;
        }
    }

    window.addEventListener('beforeunload', () => {
        if (questions.length > 0) {
            saveProgress();
        }
        return 'Do you want to start where you left off?';
    });

    restartButton.addEventListener('click', () => {
        localStorage.removeItem('quizProgress');
        fetchQuestions();
    });

    loadProgress();
    fetchQuestions();
});
