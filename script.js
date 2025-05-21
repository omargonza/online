// Data para los quizzes
const quizData = {
    trivia: {
        questions: [
            { q: "1. What’s the opposite of 'cold'?", a: ["slow", "old", "warm"], correct: 2 },
            { q: "2. What color is the sky on a clear day?", a: ["green", "blue", "black"], correct: 1 },
            { q: "3. What’s the plural of 'child'?", a: ["childs", "children", "childes"], correct: 1 },
            { q: "4. Which animal lays eggs?", a: ["dog", "cat", "chicken"], correct: 2 },
            { q: "5. What do you use to write?", a: ["spoon", "fork", "pen"], correct: 2 }
        ],
        currentQuestionIndex: 0,
        score: 0,
        answered: false
    },
    level: {
        questions: [
            { q: "1. How do you say 'perro' in English?", a: ["Dog", "Cat", "Bird"], correct: 0 },
            { q: "2. What’s the English word for 'manzana'?", a: ["banana", "apple", "orange"], correct: 1 },
            { q: "3. Choose the correct verb: 'She ____ to music.'", a: ["listen", "listens", "listened"], correct: 1 },
            { q: "4. Complete the sentence: 'I ____ to the park yesterday.'", a: ["go", "goes", "went"], correct: 2 },
            { q: "5. What is the past participle of 'eat'?", a: ["ate", "eaten", "eating"], correct: 1 }
        ],
        currentQuestionIndex: 0,
        score: 0,
        answered: false
    }
};

/**
 * Inicia o reinicia un quiz específico.
 * @param {string} quizType - 'trivia' o 'level'.
 */
function startQuiz(quizType) {
    quizData[quizType].currentQuestionIndex = 0;
    quizData[quizType].score = 0;

    // Ocultar el mensaje de inicio y mostrar el quiz
    const startMessageId = quizType === 'trivia' ? 'trivia-start-message' : 'level-start-message';
    const quizContainerId = quizType === 'trivia' ? 'trivia-quiz' : 'level-quiz';
    
    document.getElementById(startMessageId).classList.add('d-none');
    document.getElementById(quizContainerId).classList.remove('d-none');

    renderQuiz(quizType);
}

/**
 * Renderiza la pregunta actual de un quiz o los resultados si ha finalizado.
 * @param {string} quizType - 'trivia' o 'level'.
 */
function renderQuiz(quizType) {
    const quiz = quizData[quizType];
    const containerId = quizType === 'trivia' ? 'trivia-quiz' : 'level-quiz';
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Limpiar el contenido anterior

    if (quiz.currentQuestionIndex < quiz.questions.length) {
        // Mostrar la pregunta actual
        const item = quiz.questions[quiz.currentQuestionIndex];
        const div = document.createElement('div');
        div.className = 'question-box animate__animated animate__fadeIn'; // Animación al cargar la pregunta

        const questionText = document.createElement('p');
        questionText.className = 'quiz-question';
        questionText.textContent = item.q;
        div.appendChild(questionText);

        const ul = document.createElement('ul');
        ul.className = 'options quiz-options list-unstyled p-0'; // Añadir list-unstyled para quitar bullets

        item.a.forEach((answer, i) => {
            const li = document.createElement('li');
            li.textContent = answer;
            li.onclick = () => selectAnswer(quizType, i, li);
            ul.appendChild(li);
        });

        div.appendChild(ul);

        const feedbackDiv = document.createElement('p');
        feedbackDiv.id = `${quizType}-feedback`;
        feedbackDiv.className = 'quiz-feedback fw-bold';
        div.appendChild(feedbackDiv);

        const navButtonsDiv = document.createElement('div');
        navButtonsDiv.className = 'quiz-navigation-buttons';

        // Botón Anterior (solo si no es la primera pregunta)
        if (quiz.currentQuestionIndex > 0) {
            const prevButton = document.createElement('button');
            prevButton.textContent = 'Anterior';
            prevButton.className = 'btn btn-secondary';
            prevButton.onclick = () => {
                quiz.currentQuestionIndex--; // Retrocede una pregunta
                renderQuiz(quizType); // Vuelve a renderizar
            };
            navButtonsDiv.appendChild(prevButton);
        }


        const nextButton = document.createElement('button');
        nextButton.textContent = quiz.currentQuestionIndex === quiz.questions.length - 1 ? 'Finalizar Quiz' : 'Siguiente Pregunta';
        nextButton.className = 'btn btn-primary';
        nextButton.onclick = () => nextQuestion(quizType);
        nextButton.disabled = true; // Deshabilitar hasta que se seleccione una respuesta
        nextButton.id = `${quizType}-next-button`;
        navButtonsDiv.appendChild(nextButton);

        div.appendChild(navButtonsDiv);
        container.appendChild(div);

        quiz.answered = false; // Resetear estado de respuesta para la nueva pregunta
    } else {
        // Mostrar resultados si no hay más preguntas
        displayResults(quizType);
    }
}

/**
 * Maneja la selección de una respuesta en un quiz.
 * @param {string} quizType - 'trivia' o 'level'.
 * @param {number} selectedIndex - Índice de la respuesta seleccionada.
 * @param {HTMLElement} listItem - El elemento LI que fue clickeado.
 */
function selectAnswer(quizType, selectedIndex, listItem) {
    const quiz = quizData[quizType];
    if (quiz.answered) return; // Evitar selecciones múltiples en la misma pregunta

    quiz.answered = true;
    const currentQuestion = quiz.questions[quiz.currentQuestionIndex];
    const feedbackDiv = document.getElementById(`${quizType}-feedback`);
    const optionsList = listItem.parentNode;
    const allOptions = optionsList.querySelectorAll('li');
    const nextButton = document.getElementById(`${quizType}-next-button`);

    // Deshabilitar todas las opciones después de la selección
    allOptions.forEach(option => {
        option.classList.add('selected');
        // Eliminar el onclick para que no se puedan volver a seleccionar
        option.onclick = null;
    });

    if (selectedIndex === currentQuestion.correct) {
        quiz.score++;
        listItem.classList.add('correct', 'animate__animated', 'animate__pulse'); // Animación de acierto
        feedbackDiv.textContent = '✅ ¡Correcto!';
        feedbackDiv.style.color = '#28a745'; // Green
    } else {
        listItem.classList.add('incorrect', 'animate__animated', 'animate__shakeX'); // Animación de error
        allOptions[currentQuestion.correct].classList.add('correct'); // Resaltar la correcta
        feedbackDiv.textContent = '❌ Incorrecto. La respuesta correcta era: ' + currentQuestion.a[currentQuestion.correct];
        feedbackDiv.style.color = '#dc3545'; // Red
    }
    nextButton.disabled = false; // Habilitar botón para la siguiente pregunta/finalizar
}

/**
 * Avanza a la siguiente pregunta del quiz o lo finaliza.
 * @param {string} quizType - 'trivia' o 'level'.
 */
function nextQuestion(quizType) {
    const quiz = quizData[quizType];
    quiz.currentQuestionIndex++;
    renderQuiz(quizType);
}

/**
 * Muestra los resultados finales de un quiz.
 * @param {string} quizType - 'trivia' o 'level'.
 */
function displayResults(quizType) {
    const quiz = quizData[quizType];
    const containerId = quizType === 'trivia' ? 'trivia-quiz' : 'level-quiz';
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const totalQuestions = quiz.questions.length;
    const percentage = (quiz.score / totalQuestions) * 100;
    let message = '';
    let resultClass = '';

    if (percentage === 100) {
        message = '¡Excelente! ¡Dominas el inglés a la perfección!';
        resultClass = 'text-success';
    } else if (percentage >= 70) {
        message = '¡Muy bien! Tienes un buen nivel de inglés.';
        resultClass = 'text-primary';
    } else if (percentage >= 40) {
        message = '¡Nada mal! Tienes potencial, sigamos practicando para mejorar.';
        resultClass = 'text-warning';
    } else {
        message = '¡No te preocupes! Este es el lugar ideal para empezar a aprender inglés desde cero.';
        resultClass = 'text-danger';
    }

    const resultsDiv = document.createElement('div');
    resultsDiv.className = 'text-center animate__animated animate__fadeInUp';
    resultsDiv.innerHTML = `
        <h4 class="mb-3 display-6">¡Quiz Finalizado!</h4>
        <p class="fs-4">Obtuviste <span class="${resultClass}">${quiz.score} de ${totalQuestions}</span> respuestas correctas.</p>
        <p class="lead ${resultClass}">${message}</p>
        <div class="mt-4">
            <button class="btn btn-info me-2" onclick="startQuiz('${quizType}')">Volver a Intentar</button>
            <a href="#contact" class="btn btn-success" data-bs-dismiss="modal">Contactar a Miss.Noe</a>
        </div>
    `;
    container.appendChild(resultsDiv);
}

// ============================================
// === Funcionalidades al cargar el DOM ===
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Escuchadores de eventos para los botones de inicio de Quiz (Trivia y Test de Nivel)
    const startTriviaBtn = document.getElementById('start-trivia-btn');
    if (startTriviaBtn) {
        startTriviaBtn.addEventListener('click', function() {
            startQuiz('trivia');
        });
    }

    const startLevelBtn = document.getElementById('start-level-btn');
    if (startLevelBtn) {
        startLevelBtn.addEventListener('click', function() {
            startQuiz('level'); // Llama a startQuiz para el test de nivel
        });
    }

    // Smooth scroll para los enlaces de navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            // Cierra el navbar colapsado en móviles al hacer clic en un enlace
            const navbarCollapse = document.getElementById('navbarNav'); // Usar 'navbarNav' como ID del collapse
            const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapse);
            if (bsCollapse) {
                bsCollapse.hide();
            }

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Animación de secciones al hacer scroll (Scroll Reveal)
    const sections = document.querySelectorAll('section.scroll-animate');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated'); // Agrega la clase 'animated' cuando la sección es visible
                observer.unobserve(entry.target); // Deja de observar una vez que se anima
            }
        });
    }, {
        threshold: 0.1 // Porcentaje del elemento visible para activar
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});