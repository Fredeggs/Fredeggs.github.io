// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

function shuffleArray(arr) {
  let currentIndex = arr.length;
  while (currentIndex != 0) {
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }
  return arr;
}

/** Get 6 random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  const res = await axios.get("http://jservice.io/api/categories", {
    params: { count: 100 },
  });
  let shuffledData = shuffleArray(res.data);
  const categoryIds = [];
  for (let i = 0; i < 6; i++) {
    categoryIds.push(shuffledData[i].id);
  }
  return categoryIds;
}
/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
  const res = await axios.get("http://jservice.io/api/category", {
    params: { id: catId },
  });
  let category = {
    title: res.data.title,
    clues: [],
  };
  for (clue of res.data.clues) {
    const newClue = {
      question: clue.question,
      answer: clue.answer,
      showing: null,
    };
    category.clues.push(newClue);
  }
  return category;
}

async function populateCategoriesArr() {
  const categoryIds = await getCategoryIds();
  for (let catId of categoryIds) {
    const category = await getCategory(catId);
    categories.push(category);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/ 5_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
  await populateCategoriesArr();
  for (let category of categories) {
    const newTD = document.createElement("TD");
    newTD.textContent = category.title;
    console.log(categories);
    $("#categories").append(newTD);
  }
  for (let i = 0; i < 5; i++) {
    const newTR = document.createElement("TR");
    newTR.id = i;
    const questionsSection = document.getElementById("questions");
    for (let k = 0; k < 6; k++) {
      const newTD = document.createElement("TD");
      newTD.textContent = "?";
      newTD.dataset.row = i;
      newTD.dataset.column = k;
      newTR.append(newTD);
    }
    questionsSection.append(newTR);
  }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
  const categoryArrPosition = evt.target.dataset.column;
  const clueArrPosition = evt.target.dataset.row;
  const clue = categories[categoryArrPosition].clues[clueArrPosition];
  const question = clue["question"];
  const answer = clue["answer"];
  const showing = clue["showing"];
  if (showing === null) {
    evt.target.textContent = question;
    clue["showing"] = "question";
  } else if (showing === "question") {
    evt.target.textContent = answer;
    clue["showing"] = "answer";
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#categories").empty();
  $("#questions").empty();
  const loader = document.createElement("div");
  loader.classList.add("loader");
  $("table").append(loader);
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("div").remove();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
  await fillTable();
  $("td").on("click", handleClick);
  hideLoadingView();
}

/** On click of start / restart button, set up game. */

// TODO

/** On page load, add event handler for clicking clues */
const startGame = document.createElement("BUTTON");
startGame.addEventListener("click", async function () {
  categories = [];
  this.remove();
  showLoadingView();
  await setupAndStart();
  await $("table").css("display", "contents").append($(this));
});
startGame.textContent = "Restart Game";
document.querySelector("body").prepend(startGame);
