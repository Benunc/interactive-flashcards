# Cold War Flashcards

A simple web-based flashcard application for studying Cold War history. The application is designed to be easily customizable by adding new JSON quiz files.

## Features

- Multiple choice questions with immediate feedback
- Detailed explanations for each answer
- Progress tracking
- Score calculation
- Support for multiple quiz files

## Adding New Quizzes

To add a new quiz:

1. Create a new JSON file (e.g., `my_quiz.json`) with the following structure:
```json
{
    "title": "Your Quiz Title",
    "description": "A brief description of your quiz",
    "questions": [
        {
            "question": "Your question here?",
            "options": [
                "Option 1",
                "Option 2",
                "Option 3",
                "Option 4"
            ],
            "answer": 0,  // Index of the correct answer (0-3)
            "explanation": "Detailed explanation of the correct answer"
        }
        // Add more questions...
    ]
}
```

2. Add your new quiz file to the `quizFiles` array in `script.js`:
```javascript
const quizFiles = [
    'questions.json',
    'spanish_questions.json',
    'algebra2_questions.json',
    'my_quiz.json'  // Add your new quiz file here
];
```

## Running the Application

1. Clone this repository
2. Open `index.html` in a web browser
3. Select a quiz from the available options
4. Answer the questions and check your score

## File Structure

- `index.html` - Main application page
- `script.js` - Application logic
- `styles.css` - Styling
- `questions.json` - Sample Cold War quiz
- `spanish_questions.json` - Sample Spanish quiz
- `algebra2_questions.json` - Sample Algebra 2 quiz

## Contributing

Feel free to add new quiz files or improve the existing ones. When adding new quizzes, please ensure they follow the JSON structure shown above.

## License

This project is open source and available under the MIT License. 