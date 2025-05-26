import pkg from 'natural';
const { WordTokenizer, PorterStemmer, WordNet, NounInflector } = pkg;

import express, { json } from 'express';
import cors from 'cors';

const PORT = 3000;

const app = express();
app.use(cors());
app.use(json());

const tokenizer = new WordTokenizer();
const stemmer = PorterStemmer;
const wordnet = new WordNet();
const inflector = new NounInflector();

// Predefined responses
const responses = {
  "name": [
    "Hi, my name is Viktoria Miliaraki.",
    "You can call me Viktoria Miliaraki.",
    "I'm Viktoria Miliaraki."
  ],
  "profile": [
    "Hi, I'm Vicky, a CS student passionate about programming!",
    "My name is Vicky and I really like coding!",
    "I'm Vicky, a Greek student in CSD."
  ],
  "education": [
    "I'm currently studying Computer Science at the University of Crete.",
    "I'm a Computer Science student at the University of Crete."
  ],
  "skills": [
    "I am proficient in C, Java, JavaScript, and Python.",
    "I have strong skills in C, Java, JavaScript, and Python."
  ],
  "experience": [
    "I've participated in the Erasmus+ program twice during my school years.",
    "My experience includes two participations in the Erasmus+ program."
  ],
  "projects": [
    "Some of my projects include a Car rental system, an AI Pacman game, and a custom compiler.",
    "I've worked on a Car rental system, an AI Pacman game, and a custom compiler."
  ],
  "languages": [
    "My native language is Greek, and I speak English fluently.",
    "I'm a native Greek speaker and fluent in English.",
    "I can speak Greek natively and English fluently."
  ],
  "hobbies": [
    "I like gym training, reading, and playing the piano.",
    "In my free time, I enjoy gym training, reading, and playing the piano.",
    "My hobbies include gym training, reading, and playing the piano."
  ]
};

const keywords = {
  name: {
    name: 2,
    who: 1,
    called: 1,
    call: 1,
  },
  profile: {
    introduce: 2,
    identity: 2,
    something: 1,
    about: 1,
    yourself: 1
  },
  education: {
    where: 1,
    university: 2,
    school: 2,
    study: 2,
    education: 2,
    college: 2,
    graduate: 2,
    degree: 2
  },
  skills: {
    skills: 2,
    programming: 3,
    coding: 2,
    abilities: 2,
    "programming languages": 2,
    technologies: 2,
    tools: 2,
    proficient: 2,
    expertise: 2
  },
  experience: {
    experience: 2,
    school: 1 
  },
  projects: {
    projects: 2,
    build: 1,
    developed: 2,
    created: 2,
    "worked on": 2
  },
  languages: {
    language: 2,
    speak: 2,
    fluently: 2,
    native: 2
  },
  hobbies: {
    hobbies: 2,
    interests: 2,
    like: 1,
    enjoy: 1,
    "free time": 1
  }
};

const stemmedKeys = {};
for (const category in keywords) {
  stemmedKeys[category] = {};
  for (const phrase in keywords[category]) {
    const weight = keywords[category][phrase];
    const tokens = tokenizer.tokenize(phrase.toLowerCase());
    for (const token of tokens) {
      const stem = stemmer.stem(token);
      stemmedKeys[category][stem] = Math.max(stemmedKeys[category][stem] || 0, weight);
      //console.log(stemmedKeys[category][stem]);
    }
  }
}

// Helper function to get synonyms (asynchronous)
async function getSynonyms(word) {
  return new Promise((resolve) => {
      const commonFillerWords = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'to', 'of', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'do', 'you', 'my', 'what', 'who', 'how']);

      if (word.length <= 2 || commonFillerWords.has(word.toLowerCase())) {
          resolve([]);
          return;
      }

      // --- NEW LOGIC: Singularize the word before lookup ---
      const singularWord = inflector.singularize(word);
      // --- END NEW LOGIC ---

      wordnet.lookup(singularWord, function(results) { // Use singularWord for lookup
          const syns = new Set();
          results.forEach(function(result) {
              result.synonyms.forEach(function(syn) {
                  syns.add(syn.toLowerCase());
              });
          });
          resolve(Array.from(syns));
      });
  });
}

async function getResponse(prompt) { // Make getResponse async
  const words = tokenizer.tokenize(prompt.toLowerCase());

  // --- Start: Synonym Logic Addition ---
  let wordsToScore = [...words]; // Start with the original words from the prompt

  // Iterate through original words to find and add their stemmed synonyms
  for (const word of words) {
      const synonyms = await getSynonyms(word); // Await the asynchronous synonym lookup
      synonyms.forEach(syn => wordsToScore.push(syn));
  }

  // Now, stem all collected words (original + synonyms)
  const stemmedWords = wordsToScore.map(word => stemmer.stem(word));
  console.log(stemmedWords)
  // --- End: Synonym Logic Addition ---


  const categoryScores = {};
  let highestScore = 0;

  for (const category in stemmedKeys) {
    let score = 0;
    // Use the expanded and stemmed list for scoring
    for (const word of stemmedWords) {
      if (stemmedKeys[category][word]) {
        score += stemmedKeys[category][word];
      }
    }
    categoryScores[category] = score;
    if (score > highestScore) {
      highestScore = score;
    }
  }

  const selectedResponses = [];
  const threshold = Math.max(highestScore * 0.7, 1);

  for (const category in categoryScores) {
    if (categoryScores[category] >= threshold) {
      const possibleResponses = responses[category];
      if (Array.isArray(possibleResponses) && possibleResponses.length > 0) {
        const randomIndex = Math.floor(Math.random() * possibleResponses.length);
        selectedResponses.push(possibleResponses[randomIndex]);
      }
    }
  }

  if (selectedResponses.length > 0) {
    return selectedResponses;
  }
  return ["Sorry, I'm only trained to answer questions about Vicky's resume."];
}

app.post('/chat', async (req, res) => { // Make this async as getResponse is now async
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  const response = await getResponse(prompt); // Await the async function
  res.json({ response: response.join(" ") });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
