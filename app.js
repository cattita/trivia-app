const form = document.getElementById('configForm');
const quizContainer = document.getElementById('quizContainer');
const resultContainer = document.getElementById('resultContainer');
const scoreText = document.getElementById('scoreText');
const restartBtn = document.getElementById('restartBtn');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const typeSelect = document.getElementById('type');

let score = 0;
let currentQuestion = 0;
let questions = [];

document.addEventListener('DOMContentLoaded', () => {
  cargarCategorias();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await iniciarTrivia();
});

restartBtn.addEventListener('click', () => {
  quizContainer.innerHTML = '';
  resultContainer.classList.add('hidden');
  form.classList.remove('hidden');
});

const traduccionesCategorias = {
  "General Knowledge": "Conocimientos generales",
  "Entertainment: Books": "Entretenimiento: Libros",
  "Entertainment: Film": "Entretenimiento: Cine",
  "Entertainment: Music": "Entretenimiento: Música",
  "Entertainment: Television": "Entretenimiento: Televisión",
  "Entertainment: Video Games": "Entretenimiento: Videojuegos",
  "Entertainment: Board Games": "Entretenimiento: Juegos de mesa",
  "Science & Nature": "Ciencia y Naturaleza",
  "Science: Computers": "Ciencia: Computación",
  "Science: Mathematics": "Ciencia: Matemáticas",
  "Mythology": "Mitología",
  "Sports": "Deportes",
  "Geography": "Geografía",
  "History": "Historia",
  "Politics": "Política",
  "Art": "Arte",
  "Celebrities": "Celebridades",
  "Animals": "Animales",
  "Vehicles": "Vehículos",
  "Entertainment: Comics": "Entretenimiento: Cómics",
  "Science: Gadgets": "Ciencia: Tecnología",
  "Entertainment: Japanese Anime & Manga": "Entretenimiento: Anime y Manga",
  "Entertainment: Cartoon & Animations": "Entretenimiento: Dibujos animados"
};

const cargarCategorias = async () => {
  try {
    const res = await fetch('https://opentdb.com/api_category.php');
    const data = await res.json();
    data.trivia_categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = traduccionesCategorias[cat.name] || cat.name;
      categorySelect.appendChild(option);
    });
  } catch (error) {
    alert('Error al cargar categorías. Intenta nuevamente.');
    console.error(error);
  }
};

const iniciarTrivia = async () => {
  const category = categorySelect.value;
  const difficulty = difficultySelect.value;
  const type = typeSelect.value;
  const url = `https://opentdb.com/api.php?amount=10&category=${category}&difficulty=${difficulty}&type=${type}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.response_code !== 0) throw new Error('No se pudieron obtener preguntas.');

    questions = data.results;
    score = 0;
    currentQuestion = 0;

    form.classList.add('hidden');
    resultContainer.classList.add('hidden');
    mostrarPregunta();
  } catch (error) {
    alert('Error al obtener preguntas. Intenta más tarde.');
    console.error(error);
  }
};

const traduccionesRespuestas = {
  "True": "Verdadero",
  "False": "Falso"
};

const traducirRespuesta = (texto) => {
  return traduccionesRespuestas[texto] || texto;
};

const respuestaOriginal = (textoTraducido) => {
  const entries = Object.entries(traduccionesRespuestas);
  const encontrada = entries.find(([ing, esp]) => esp === textoTraducido);
  return encontrada ? encontrada[0] : textoTraducido;
};

const mostrarPregunta = () => {
  if (currentQuestion >= questions.length) {
    mostrarResultado();
    return;
  }

  const pregunta = questions[currentQuestion];
  const respuestas = [...pregunta.incorrect_answers, pregunta.correct_answer].sort(() => Math.random() - 0.5);

  quizContainer.innerHTML = `
    <div class="quiz-question">
      <h3>${decodeHTML(pregunta.question)}</h3>
      <div class="answers">
        ${respuestas.map(resp => `<button class="answer">${traducirRespuesta(decodeHTML(resp))}</button>`).join('')}
      </div>
    </div>
  `;

  quizContainer.classList.remove('hidden');

  document.querySelectorAll('.answer').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const seleccionTraducida = e.target.textContent;
      const seleccion = respuestaOriginal(seleccionTraducida);
      const correcta = decodeHTML(pregunta.correct_answer);

      if (seleccion === correcta) {
        score += 100;
      }

      currentQuestion++;
      mostrarPregunta();
    });
  });
};

const mostrarResultado = () => {
  quizContainer.classList.add('hidden');
  scoreText.textContent = `Tu puntaje fue: ${score} puntos.`;
  resultContainer.classList.remove('hidden');
};

const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};
