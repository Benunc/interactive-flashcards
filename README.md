# Multiple Choice Quiz Generator

A web-based quiz application that allows you to create and take multiple-choice quizzes on any topic. The application supports multiple quiz files, provides immediate feedback, and includes detailed explanations for each answer. Perfect for students, teachers, or anyone looking to test their knowledge on various subjects.

## Features

- Multiple choice questions with immediate feedback
- Detailed explanations for each answer
- Progress tracking
- Score calculation
- Support for multiple quiz files

## Adding New Quizzes

### Method 1: Using an LLM

You can use any Large Language Model (like ChatGPT, Claude, or Gemini) to generate quiz JSON files. Here's how:

1. Open your preferred LLM
2. Copy and paste this prompt (replace the bracketed text with your topic):
```
Create a JSON file for a multiple-choice quiz about [YOUR TOPIC]. The quiz should:
- Have a clear title and description
- Include 10-15 questions
- Each question should have 4 options
- Include detailed explanations for each answer
- Focus on key concepts and their relationships
- Use clear, engaging language
- Format the response as valid JSON

The JSON structure should be:
{
    "title": "Quiz Title",
    "description": "Quiz description",
    "questions": [
        {
            "question": "Question text?",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": 0,  // Index of correct answer (0-3)
            "explanation": "Detailed explanation"
        }
    ]
}
```

3. Copy the generated JSON
4. Save it as a new file (e.g., `my_topic_questions.json`) in the root directory
5. Add the filename to the `quizFiles` array in `script.js`

### Method 2: Manual Creation

To create a quiz manually:

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