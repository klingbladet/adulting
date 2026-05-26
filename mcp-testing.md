# MCP Testing Guide

This document explains how to start, test and demo the Adulting MCP server.

The MCP server exposes tools for the AI/adaptive learning flow:

- `generate_quiz_from_lesson_blocks`
- `get_lesson_context`
- `calculate_block_priorities`

The server currently uses mock lesson data until the real lessonbuilder/database flow is ready.

---

## 1. What the MCP server does

The MCP server acts as a tool layer between AI clients and the learning platform.

Current MVP flow:

```txt
Expert-created lesson blocks
  -> AI-generated quiz questions
  -> quiz answers mapped back to blockId
  -> block priorities
  -> adaptive learning recommendations

The important technical idea is that every generated quiz question is linked to a specific lesson block:

quiz_question.blockId -> lesson_block.id

That makes it possible to personalize the course based on what the learner already understands.

2. Start the project

From the project root:

docker compose up

Or start only the MCP service:

docker compose up mcp

The MCP server should run on:

http://localhost:3003
3. Check MCP health

Open in browser or Thunder Client:

GET http://localhost:3003/health

Expected response:

{
  "ok": true,
  "service": "adulting-learning-mcp",
  "transport": "streamable-http",
  "mcpEndpoint": "/mcp"
}
4. Start MCP Inspector

From the project root:

npx @modelcontextprotocol/inspector

Inspector will print a local URL, for example:

http://localhost:6274/?MCP_PROXY_AUTH_TOKEN=...

Open that URL in the browser.

5. Connect Inspector to the MCP server

In MCP Inspector, use:

Transport Type: Streamable HTTP
Connection Type: Via Proxy
URL: http://localhost:3003/mcp

Click:

Connect

After connecting, these tools should be visible:

generate_quiz_from_lesson_blocks
get_lesson_context
calculate_block_priorities
6. Test tool: get_lesson_context

Tool:

get_lesson_context

Input:

{
  "lessonId": "lesson_bolan_001"
}

Expected result:

lesson metadata
ordered lesson blocks
AI-readable block text
prompt context for the AI assistant

This demonstrates that the MCP server can read lesson content.

7. Test tool: calculate_block_priorities

Tool:

calculate_block_priorities

Input:

{
  "lessonId": "lesson_bolan_001",
  "answers": [
    {
      "blockId": "block_bolan_text_004",
      "isCorrect": false
    },
    {
      "blockId": "block_bolan_text_004",
      "isCorrect": false
    }
  ],
  "includeUnansweredBlocks": true
}

Expected result:

block_bolan_text_004 should be marked as high priority
other quiz-eligible blocks are included if includeUnansweredBlocks is true

This demonstrates adaptive learning:

quiz answers -> block mastery -> recommended focus
8. Test tool: generate_quiz_from_lesson_blocks

Tool:

generate_quiz_from_lesson_blocks

Input:

{
  "lessonId": "lesson_bolan_001",
  "questionCountPerBlock": 2,
  "language": "sv",
  "difficulty": "medium",
  "saveAsDraft": false
}

Expected result:

quiz status: preview
generated multiple-choice questions
every question has a blockId
questions are written in Swedish

This requires:

OPENROUTER_API_KEY

to be set in the MCP service environment.

9. Current mock lesson IDs

Available mock lessons:

lesson_bolan_001
lesson_hyreskontrakt_001
10. Useful REST routes

The same learning logic can also be tested through the normal backend.

Backend base URL:

http://localhost:3001

Health:

GET /api/learning/health

List mock lessons:

GET /api/learning/lessons

Get lesson with blocks:

GET /api/learning/lessons/lesson_bolan_001

Get AI-readable lesson context:

GET /api/learning/lessons/lesson_bolan_001/context

Generate quiz through REST:

POST /api/learning/lessons/lesson_bolan_001/generate-quiz

Body:

{
  "questionCountPerBlock": 2,
  "language": "sv",
  "difficulty": "medium",
  "saveAsDraft": false
}

Demo block priorities:

GET /api/learning/lessons/lesson_bolan_001/priorities/demo

Learning-aware AI assistant:

POST /api/learning-assistant/chat

Body:

{
  "userId": "demo-user-1",
  "lessonId": "lesson_bolan_001",
  "courseId": "course_bostad_001",
  "mode": "lesson_help",
  "message": "Kan du förklara kontantinsats enklare?",
  "quizAnswers": [
    {
      "blockId": "block_bolan_text_004",
      "isCorrect": false
    },
    {
      "blockId": "block_bolan_text_004",
      "isCorrect": false
    }
  ],
  "includeDebugContext": true
}
11. Environment variables

Current local development setup:

MCP_PORT=3003
MCP_HOST=0.0.0.0
LEARNING_LESSON_PROVIDER=mock
LEARNING_PROFILE_PROVIDER=mock
OPENROUTER_API_KEY=...
OPENROUTER_MODEL=...

When the real lessonbuilder/database flow is ready:

LEARNING_LESSON_PROVIDER=database

When real onboarding profile mapping is ready:

LEARNING_PROFILE_PROVIDER=database
12. Troubleshooting
Health works but Inspector does not connect

Check that Inspector uses:

Transport Type: Streamable HTTP
Connection Type: Via Proxy
URL: http://localhost:3003/mcp

Restart MCP:

docker compose restart mcp

Or rebuild:

docker compose up --build mcp
Tool generate_quiz_from_lesson_blocks fails

Check that the MCP container has access to:

OPENROUTER_API_KEY

Check logs:

docker compose logs mcp
Lesson not found

Use one of the current mock lesson IDs:

lesson_bolan_001
lesson_hyreskontrakt_001
MCP server runs stale code

Rebuild the MCP container:

docker compose up --build mcp

You can inspect files inside the container:

docker compose exec mcp grep -n "createAdultingMcpServer" /app/src/mcp/create-mcp-server.ts
13. Jury demo script

Suggested demo flow:

Open MCP Inspector.
Connect to:
http://localhost:3003/mcp
Run get_lesson_context.

Show that the MCP server can read lesson blocks.

Run generate_quiz_from_lesson_blocks.

Show that AI creates quiz questions from blocks and preserves blockId.

Run calculate_block_priorities.

Show that incorrect quiz answers produce recommended focus blocks.

Show the frontend demo page.

Show:

lesson blocks -> AI quiz -> block priority -> adaptive lesson support

Demo message:

We use MCP as a tool layer for adaptive learning.
Expert-created lesson blocks become AI-generated quizzes.
Quiz results are mapped back to block IDs so the course can adapt to the learner.
14. Current MCP tools
generate_quiz_from_lesson_blocks

Generates quiz questions from quiz-eligible lesson blocks.

Useful for:

expert/creator workflows
quiz draft generation
future AI-assisted course creation
get_lesson_context

Returns lesson content in an AI-readable format.

Useful for:

lesson-aware AI assistant
explaining course material
contextual help inside a lesson
calculate_block_priorities

Calculates which blocks the learner should focus on based on quiz answers.

Useful for:

adaptive learning
recommended focus areas
future personalized lesson order

---
