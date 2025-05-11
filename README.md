# Interactive Flashcard System

A flexible flashcard system that supports multiple topics and can be easily populated with content from Google Classroom.

## Creating New Quizzes

### Method 1: Using Google Sheets

1. Create a new Google Sheet
2. Copy the template from `quiz_template.csv`
3. Fill in your quiz content:
   - First row: Quiz title, description, and total number of questions
   - Leave one empty row
   - Next row: Headers (question, option1, option2, option3, option4, correct_answer, explanation)
   - Following rows: Your questions and answers
4. Export as CSV
5. Convert to JSON using the provided script:
   ```bash
   python convert_quiz.py your_quiz.csv your_quiz.json
   ```
6. Add the quiz to `quiz_config.json`:
   ```json
   {
       "id": "your_quiz_id",
       "title": "Your Quiz Title",
       "description": "Your quiz description",
       "file": "your_quiz.json"
   }
   ```

### Method 2: Direct JSON Creation

You can also create quiz files directly in JSON format following this structure:
```json
{
    "title": "Your Quiz Title",
    "description": "Your quiz description",
    "totalQuestions": number_of_questions,
    "questions": [
        {
            "question": "Your question",
            "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
            "answer": index_of_correct_answer,
            "explanation": "Explanation of the answer"
        }
    ]
}
```

## Running the Application

1. Start the local server:
   ```bash
   python -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```

## Tips for Teachers

1. **Creating Quizzes in Google Classroom**:
   - Create a quiz in Google Classroom
   - Export the questions to a spreadsheet
   - Use the template format to organize the content
   - Convert to JSON using the provided script

2. **Best Practices**:
   - Keep questions clear and concise
   - Provide detailed explanations for answers
   - Use consistent formatting
   - Test the quiz before sharing with students

3. **Sharing with Students**:
   - Host the application on a web server
   - Share the URL with your students
   - Students can access the quizzes from any device with a web browser

## File Structure

- `index.html` - Main application file
- `styles.css` - Styling for the application
- `script.js` - Application logic
- `quiz_config.json` - Configuration file for available quizzes
- `quiz_template.csv` - Template for creating new quizzes
- `convert_quiz.py` - Script to convert CSV to JSON
- `*.json` - Individual quiz files 