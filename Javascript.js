
  const flashcard = document.querySelector('.flashcard');
  const moreInfoBtn = document.getElementById('moreInfoBtn');
  const previousBtn = document.getElementById('previousBtn');
  const flipBtn = document.getElementById('flipBtn');
  const nextBtn = document.getElementById('nextBtn');
  const speakAnswerBtn = document.getElementById('speakAnswerBtn');
  const voiceOutput = document.getElementById('voiceOutput');

  let flipped = false;
  let recognizing = false;
  let recognition;

  // Sample flashcard content (you can remove this since we'll fetch data from a JSON file)
  let flashcardData = [];

  // Function to shuffle the flashcardData array randomly
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Fetch the flashcard data from the JSON file on GitHub
  fetch('https://raw.githubusercontent.com/mastermedical/multipage/main/flashcardswithkeywords.json')
    .then((response) => response.json())
    .then((data) => {
      flashcardData = data; // Store the fetched data in the flashcardData variable
      shuffleArray(flashcardData); // Shuffle the flashcardData array before displaying the flashcards
      currentFlashcardIndex = 0; // Reset the current flashcard index to the beginning
      updateFlashcard(); // Initial update of the flashcard content after fetching the data
    })
    .catch((error) => {
      console.error('Error fetching flashcard data:', error);
    });

  // Array to keep track of the flipped state for each flashcard
  let flippedState = new Array(flashcardData.length).fill(false);

  // Initialize the currentFlashcardIndex
  let currentFlashcardIndex = 0;

  // Function to update the flashcard content
  function updateFlashcard() {
    const { question, answer, keywords } = flashcardData[currentFlashcardIndex]; // Get the keywords
    const questionContainer = document.querySelector('.question');
    const answerContainer = document.querySelector('.answer');

    // Update the question text (remains always visible)
    questionContainer.innerHTML = `<h2>${question}</h2>`;

    // Update the answer text (initially hidden)
    answerContainer.innerHTML = `<h2>${answer}</h2>`;
    answerContainer.style.display = 'none';
    flipped = false;

    // Enable or disable the "Flip" button based on the flippedState for this flashcard
    flipBtn.disabled = flippedState[currentFlashcardIndex];

    // Update the font size of the voice output box to match the flashcard text
    const fontSize = window.getComputedStyle(questionContainer).getPropertyValue('font-size');
    voiceOutput.style.fontSize = fontSize;

    // Clear the voice output and result when moving to a new flashcard
    voiceOutput.textContent = '';
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.textContent = '';

    // Disable the "Mark answer" button for the new flashcard
    const markAnswerBtn = document.getElementById('markAnswerBtn');
    markAnswerBtn.disabled = true;

    // Display the keywords for this flashcard (optional, you can customize how you want to show them)
    const keywordContainer = document.getElementById('keywordContainer');
    keywordContainer.textContent = `Keywords: ${keywords.join(', ')}`;
  }

  // Function to handle the "Flip" button
  function flipFlashcard() {
    if (!flipped && !flippedState[currentFlashcardIndex]) {
      const answerContainer = document.querySelector('.answer');
      answerContainer.style.display = 'block';
      flipped = true;
      flippedState[currentFlashcardIndex] = true;
      moreInfoBtn.disabled = false; // Enable "More info" button
      flipBtn.disabled = true; // Disable "Flip" button for this flashcard
      
      // Start the timer when the user flips the flashcard
      startTimer(); // Call the function to start the timer
    }
    // Stop the timer when the "Speak answer" button is pressed
      clearInterval(timerInterval);
  }

// Function to handle the "Next" button
function nextFlashcard() {

  if (currentFlashcardIndex < flashcardData.length - 1) {
    // Stop the ongoing recognition if it's active
    if (recognizing) {
      recognition.stop();
      recognizing = false;
    }
        // Start the timer when the user flips the flashcard
      clearInterval(timerInterval); // Reset the timer interval
      startTimer();
      
    currentFlashcardIndex++;
    flipped = false; // Reset flipped state when moving to the next flashcard
    updateFlashcard();
    moreInfoBtn.disabled = true; // Disable "More info" button until flipped again
    voiceOutput.textContent = ''; // Clear the voice output box
    // Reset the "Mark answer" button state when moving to a different flashcard
    answerDictated = false;
    document.getElementById('markAnswerBtn').disabled = true;
  }

}

// Function to handle the "Previous" button
function previousFlashcard() {
  if (currentFlashcardIndex > 0) {
    // Stop the ongoing recognition if it's active
    if (recognizing) {
      recognition.stop();
      recognizing = false;
    }
          
      // Start the timer when the user flips the flashcard
      clearInterval(timerInterval); // Reset the timer interval
      startTimer();
      
    currentFlashcardIndex--;
    flipped = false; // Reset flipped state when moving to the previous flashcard
    updateFlashcard();
    moreInfoBtn.disabled = true; // Disable "More info" button until flipped again
    voiceOutput.textContent = ''; // Clear the voice output box
    // Reset the "Mark answer" button state when moving to a different flashcard
    answerDictated = false;
    document.getElementById('markAnswerBtn').disabled = true;
  }

}

  // Function to handle the "More info" button and display the overlay box
  function showMoreInfo() {
    if (flipped) {
      // Get the moreInfo content from the current flashcard data
      const moreInfoContent = flashcardData[currentFlashcardIndex].moreInfo;
      const overlayText = document.getElementById('overlayText');
      overlayText.textContent = moreInfoContent;

      // Show the overlay box
      const overlay = document.querySelector('.overlay');
      overlay.style.display = 'block';
    }
  }

// Function to handle the "Speak answer" button
function toggleDictation() {
  if (!recognizing) {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-UK'; // Set language to English (you can change it to another language if needed)

    recognition.onstart = () => {
      recognizing = true;
      speakAnswerBtn.textContent = 'Stop dictation'; // Change button text to 'Stop dictation' during voice recognition
      // Stop the timer when the "Speak answer" button is pressed
      clearInterval(timerInterval);
    };

    recognition.onend = () => {
      recognizing = false;
      speakAnswerBtn.textContent = 'Speak answer'; // Change button text back to 'Speak answer' when voice recognition stops
      // Enable the "Mark answer" button if an answer has been dictated
      document.getElementById('markAnswerBtn').disabled = !answerDictated;
     
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      voiceOutput.textContent = transcript; // Update the voice output text
      // Mark that an answer has been dictated
      answerDictated = true;

      // Enable or disable the "Mark answer" button based on voice recognition state
      const markAnswerBtn = document.getElementById('markAnswerBtn');
      markAnswerBtn.disabled = recognizing || voiceOutput.textContent.trim() === '';


    };

    recognition.start();
  } else {
    recognition.stop();
    recognizing = false;
    speakAnswerBtn.textContent = 'Speak answer'; // Change button text back to 'Speak answer' when voice recognition stops
    // Enable the "Mark answer" button if an answer has been dictated
    document.getElementById('markAnswerBtn').disabled = !answerDictated;

    // Call markAnswer() if recognition stops without speech input
    if (answerDictated && voiceOutput.textContent.trim() === '') {
      markAnswer();
    }
  }
}

  // Function to update the voice output text
  function updateVoiceOutput(text) {
    voiceOutput.textContent = text;
  }

  // Function to close the overlay box when the close button (X) is clicked
  function closeOverlay() {
    const overlay = document.querySelector('.overlay');
    overlay.style.display = 'none';
  }
  
  // Add an event listener to the "Dark Mode" option in the drop-down menu
document.getElementById('darkModeOption').addEventListener('click', toggleDarkMode);

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-mode');
}

  // Attach event listeners to the buttons
  moreInfoBtn.addEventListener('click', showMoreInfo);
  flipBtn.addEventListener('click', flipFlashcard);
  nextBtn.addEventListener('click', nextFlashcard);
  previousBtn.addEventListener('click', previousFlashcard);

  // Add event listener for "Speak answer" button when implementing voice recognition
  speakAnswerBtn.addEventListener('click', toggleDictation);
  
      // Function to preprocess the answer
    function preprocessAnswer(answer) {
        return answer.trim().toLowerCase();
    }

    // Function to tokenize the answer
    function tokenizeAnswer(answer) {
        return answer.split(/\s+/); // Split on whitespace to get individual words
    }

    // Function to remove stop words from the answer
    function removeStopWords(tokens) {
        const stopWords = ['a', 'an', 'the', 'is', 'in', 'and', 'on']; // Add more as needed
        return tokens.filter(token => !stopWords.includes(token));
    }

    // Function to calculate Jaccard similarity between two sets
    function jaccardSimilarity(setA, setB) {
        const intersection = new Set([...setA].filter(token => setB.has(token)));
        const union = new Set([...setA, ...setB]);
        return intersection.size / union.size;
    }


// Function to check if the dictated answer contains keywords from the flashcard answer
function keywordMatching(dictatedAnswer, flashcardAnswer) {
  const preprocessedDictatedAnswer = preprocessAnswer(dictatedAnswer);
  const preprocessedFlashcardAnswer = preprocessAnswer(flashcardAnswer);

  const dictatedTokens = new Set(removeStopWords(tokenizeAnswer(preprocessedDictatedAnswer)));
  const flashcardTokens = new Set(removeStopWords(tokenizeAnswer(preprocessedFlashcardAnswer)));

  // Check if any of the dictated tokens exist in the flashcard tokens
  const hasMatchingKeywords = [...dictatedTokens].some(token => flashcardTokens.has(token));

  return hasMatchingKeywords;
}


  // Function to handle the "Mark answer" button and provide feedback
  function markAnswer() {
    const dictatedAnswer = voiceOutput.textContent; // Assuming you already have the dictated answer
    const { answer, keywords } = flashcardData[currentFlashcardIndex]; // Get the answer and keywords

    // Convert the dictated answer and keywords to lowercase for case-insensitive matching
    const preprocessedDictatedAnswer = dictatedAnswer.trim().toLowerCase();
    const preprocessedKeywords = keywords.map(keyword => keyword.toLowerCase());

    // Check if the dictated answer contains any of the keywords
    const isAnswerCorrect = preprocessedKeywords.some(keyword => preprocessedDictatedAnswer.includes(keyword));

    let result;

    if (isAnswerCorrect) {
      // Mark the answer as correct
      result = "Correct answer!";
    } else {
      // Mark the answer as incorrect
      result = "Incorrect answer!";
    }

    // Show the result in the result container
    const resultContainer = document.getElementById('resultContainer');
    resultContainer.textContent = result;
  }


// Function for timer
let remainingTime = 10; // Initial time limit in seconds
let timerInterval;

function startTimer() {
  remainingTime = 10; // Reset the remaining time to the initial value
  updateTimerDisplay(); // Update the timer display with the initial value
  timerInterval = setInterval(updateTimer, 1000); // Start the timer interval
}

function updateTimerDisplay() {
  const timeRemainingElement = document.getElementById('timeRemaining');
  timeRemainingElement.textContent = remainingTime;
}

function updateTimer() {
  if (remainingTime > 0) {
    remainingTime--;
    updateTimerDisplay();
  } else {
    clearInterval(timerInterval); // Stop the timer interval when time runs out
    // Here, you can implement the logic to mark the answer as incorrect due to timeout.
    console.log("Time's up! Marking answer as incorrect.");
  }
}

