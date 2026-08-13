#!/usr/bin/env bash
set -euo pipefail

API_URL="http://localhost:8000/api/v1"

echo "==> Running Smoke Test <=="

echo "Health check..."
curl -fsS http://localhost:8000/health-check

echo -e "\n\nFetching ME..."
curl -fsS "$API_URL/me" | jq .

echo -e "\n\nFetching Stats..."
curl -fsS "$API_URL/me/stats" | jq .

echo -e "\n\nFetching Path..."
curl -fsS "$API_URL/path" | jq '{units: [.units[0].skills[0]]}'

echo -e "\n\nStarting Lesson 1..."
START_RES=$(curl -fsS -X POST "$API_URL/lessons/1/start")
echo $START_RES | jq .
ATTEMPT_ID=$(echo $START_RES | jq -r .attempt_id)

echo -e "\n\nSubmitting Answer 1 (Wrong)..."
curl -fsS -X POST "$API_URL/lesson-attempts/$ATTEMPT_ID/answers" \
    -H "Content-Type: application/json" \
    -d '{"exercise_id": 1, "answer": "Wrong answer"}' | jq .

echo -e "\n\nSubmitting Answer 1 (Correct)..."
curl -fsS -X POST "$API_URL/lesson-attempts/$ATTEMPT_ID/answers" \
    -H "Content-Type: application/json" \
    -d '{"exercise_id": 1, "answer": "Hola"}' | jq .

echo -e "\n\nSubmitting Answer 2..."
curl -fsS -X POST "$API_URL/lesson-attempts/$ATTEMPT_ID/answers" \
    -H "Content-Type: application/json" \
    -d '{"exercise_id": 2, "answer": ["Hola"]}' | jq .

echo -e "\n\nSubmitting Answer 3..."
curl -fsS -X POST "$API_URL/lesson-attempts/$ATTEMPT_ID/answers" \
    -H "Content-Type: application/json" \
    -d '{"exercise_id": 3, "answer": "Hola"}' | jq .

echo -e "\n\nCompleting Lesson..."
curl -fsS -X POST "$API_URL/lesson-attempts/$ATTEMPT_ID/complete" | jq .

echo -e "\n\nFetching Final Stats..."
curl -fsS "$API_URL/me/stats" | jq .

echo -e "\n\nFetching Leaderboard..."
curl -fsS "$API_URL/leaderboard" | jq '{current_user_rank: .current_user_rank}'

echo -e "\n\nRefilling Hearts..."
curl -fsS -X POST "$API_URL/me/hearts/refill" | jq .

echo -e "\n\n==> Smoke Test Complete <=="
