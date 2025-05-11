import csv
import json
import sys
import os

def convert_csv_to_json(csv_file, output_file):
    # Read the CSV file
    with open(csv_file, 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        
        # Read quiz metadata
        metadata = next(reader)
        quiz_title = metadata[0]
        quiz_description = metadata[1]
        total_questions = int(metadata[2])
        
        # Skip empty line
        next(reader)
        
        # Read header
        header = next(reader)
        
        # Read questions
        questions = []
        for row in reader:
            if len(row) >= 7:  # Ensure row has all required fields
                question = {
                    "question": row[0],
                    "options": [
                        row[1],  # option1
                        row[2],  # option2
                        row[3],  # option3
                        row[4]   # option4
                    ],
                    "answer": int(row[5]),
                    "explanation": row[6]
                }
                questions.append(question)
        
        # Create the JSON structure
        quiz_data = {
            "title": quiz_title,
            "description": quiz_description,
            "totalQuestions": total_questions,
            "questions": questions
        }
        
        # Write to JSON file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=4)
        
        print(f"Successfully converted {csv_file} to {output_file}")
        print(f"Created quiz with {len(questions)} questions")

def main():
    if len(sys.argv) != 3:
        print("Usage: python convert_quiz.py input.csv output.json")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    if not os.path.exists(input_file):
        print(f"Error: Input file {input_file} does not exist")
        sys.exit(1)
    
    convert_csv_to_json(input_file, output_file)

if __name__ == "__main__":
    main() 