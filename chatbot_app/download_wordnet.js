import { WordNet } from 'natural';
const wordnet = new WordNet();

// This will download the WordNet database to your system
// if it's not already present. It might take a moment.
wordnet.lookup('test', function(results) {
    // This is just to trigger the download if needed.
    // You won't typically run a lookup like this just for setup.
});
