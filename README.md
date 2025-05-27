# resume-chatbot

Front-end: HTML, JS, Bootstrap CSS
Back-end: Node.js, Express

Logic : uses Natural, a natural language facility of node.js. I used the tonkenizer, stemmer, WordNet, and inflector.

Key feautures of the application:
- Can give answers for multiple categories when asked (e.g. what's your name and hobbies?)
- Finds synonyms for the words in the prompt so it can recognize them even if they aren't stored in the key words of that category
 (e.g. "what did you make?" -> gives the projects rensponse, since "make" is a synonym for "create", which is one keyword in projects)
- Stems words so it recognizes derivative words, plural form etc.
- Assigns weights to each keyword so that the more important words are prioritized (e.g "what languages do you like" focused on "languages", not on "like", since the latter is a keyword for hobbies)
- The answers for each category vary
- Works on mobile too (with some adjustments for the ip)

Improvements I could have made:
- make the chatbot ask for clarifications (e.g programming or regular languages)

