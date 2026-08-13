from fastapi.testclient import TestClient
from app.main import app

def main():
    client = TestClient(app)
    
    # 1. Start lesson 2 (it has all 5 exercise types)
    res = client.post("/api/v1/lessons/2/start")
    if res.status_code != 200:
        print("Failed to start lesson:", res.json())
        return
        
    data = res.json()
    attempt_id = data["attempt_id"]
    print(f"Started attempt {attempt_id}")
    
    exercises = data["exercises"]
    
    answers = [
        "Manzana",
        ["Yo", "como", "una", "manzana"],
        "Manzana",
        ["soy"],
        {"pairs": [{"left": "Hello", "right": "Hola"}, {"left": "Thanks", "right": "Gracias"}]}
    ]
    
    for i, ex in enumerate(exercises):
        ans_res = client.post(f"/api/v1/lesson-attempts/{attempt_id}/answers", json={
            "exercise_id": ex["id"],
            "answer": answers[i]
        })
        if ans_res.status_code != 200:
            print(f"Failed exercise {i}:", ans_res.json())
            return
            
        ans_data = ans_res.json()
        if not ans_data["correct"]:
            print(f"Incorrect on exercise {i}:", ans_data)
            return
            
        print(f"Exercise {i} correct!")
        
    print("All exercises completed successfully.")

if __name__ == "__main__":
    main()
