const questions = [];
const currentQuestion = {};
let score = 0;
let resolvedQuestions = 0;

const $ = (selector) => document.querySelector(selector);

$(".score").innerHTML = score;

function setScore() {
  $(".score").innerHTML = score;
}

async function loadQuestions() {
  const data = await fetch("./formatted_questions.json");

  const result = await data.json();

  return result;
}

const questionRef = {
  box: $(".question"),
  options: $(".option-list"),
  title: $("#question"),
  submit: $(".submit"),
  next: $(".next"),
};

function endGame() {
  return resolvedQuestions === questions.length;
}

function getNextQuestion() {
  const nextQuestion = questions[resolvedQuestions];

  return nextQuestion;
}

function setTitle(text) {
  const { title } = questionRef;
  title.innerHTML = text + "?";
}

function setOptions(answers) {
  const { options } = questionRef;
  options.innerHTML = "";
  answers.forEach((answer, index) => {
    const li = document.createElement("li");
    li.setAttribute("data-answer", index + 1);
    li.innerHTML = answer;
    options.append(li);
  });
}

function toggleClass(...elements) {
  return function (...className) {
    elements.forEach((el) =>
      className.forEach((cl) => el.classList.toggle(cl))
    );
  };
}

function verifyAnswer() {
  const selectedAnswer = $(".selected").dataset.answer;
  const correctAnswer = questions.find(
    (q) => q.id === currentQuestion.id
  ).answer;

  const isCorrect = selectedAnswer == correctAnswer;
  showAnswerResult(isCorrect);
}

function resetGame() {
  score = 0;
  setScore();
  resolvedQuestions = 0;
}

window.addEventListener("load", function () {
  $("#range").innerHTML = $("#question-volume").value;
});

$("#question-volume").addEventListener("change", function () {
  $("#range").innerHTML = this.value;
});

function toggleBtnDisplay() {
  const { next, submit } = questionRef;
  toggleClass(next, submit)("hidden");
}

function showAnswerResult(isCorrect) {
  const selectedAnswer = $(".selected");
  if (isCorrect) {
    toggleClass(selectedAnswer)("selected", "correct-answer");
    toggleBtnDisplay();
    score += 10;
  } else {
    toggleClass(selectedAnswer)("selected", "wrong-answer");
    score -= 5;
  }
  setScore();
}

function displayQuestion(question) {
  if (!endGame()) {
    const { questionTitle, options, id } = question;
    setTitle(questionTitle);
    setOptions(options);
    currentQuestion.id = id;
    resolvedQuestions++;
  } else {
    alert("acabou o jogo!!!!");
    toggleClass($(".start"), questionRef.box, $(".range"))("hidden");
  }
}

questionRef.options.addEventListener("click", function (event) {
  const el = event.target;
  if (el.nodeName === "LI") {
    const options = Array.from(this.children);
    options.forEach((li) =>
      li.classList.remove("selected", "correct-answer", "wrong-answer")
    );
    toggleClass(el)("selected");
    questionRef.submit.removeAttribute("disabled");
  }
});

questionRef.submit.addEventListener("click", verifyAnswer);

questionRef.next.addEventListener("click", function () {
  displayQuestion(getNextQuestion());
  toggleBtnDisplay();
  questionRef.submit.setAttribute("disabled", "disabled");
});

$(".start").addEventListener("click", async function () {
  toggleClass(this, questionRef.box, $(".range"))("hidden");

  const loadedQuestions = await loadQuestions();

  const questionsRange = $("#question-volume").value * -1;

  const q = loadedQuestions
    .sort(() => Math.random() - 0.5)
    .slice(questionsRange);

  questions.length = 0;

  questions.push(...q);

  resetGame();

  displayQuestion(getNextQuestion());
});
