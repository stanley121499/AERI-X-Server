## API Endpoints

### AI Processing Endpoint

**Endpoint**: `POST /api/ai`

**Description**: Sends a prompt to the AI engine and returns the response with actions to take. Now supports conversation history for contextual responses.

**Request Body**:
```json
{
  "prompt": "String prompt for the AI to process",
  "conversationHistory": [
    {
      "role": "user",
      "content": "How much did I spend on groceries last month?"
    },
    {
      "role": "assistant",
      "content": "You spent $432.87 on groceries last month."
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Response message from the AI",
  "actions": [
    {
      "type": "respond",
      "data": null,
      "message": "Detailed response from the AI"
    }
  ],
  "conversationHistory": [
    // Previous conversation messages
    {
      "role": "user", 
      "content": "How much did I spend on groceries last month?"
    },
    {
      "role": "assistant",
      "content": "You spent $432.87 on groceries last month."
    },
    // New messages from this interaction
    {
      "role": "user",
      "content": "And what about dining out?"
    },
    {
      "role": "assistant",
      "content": "You spent $215.50 on dining out last month."
    }
  ]
}
```
