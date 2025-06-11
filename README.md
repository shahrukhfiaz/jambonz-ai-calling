# Jambonz AI Calling Application

This application demonstrates how to build an AI-powered calling system using Jambonz, GPT-4 Mini, and Deepgram (for STT/TTS). It supports both inbound and outbound calls with natural language conversation capabilities.

## Features

- Inbound call handling with AI conversation
- Outbound call capability with AI interaction
- Real-time speech-to-text using Deepgram (configured in Jambonz)
- Natural language processing using GPT-4 Mini
- Text-to-speech synthesis using Deepgram (configured in Jambonz)

## Prerequisites

1. A Jambonz account with:
   - Configured Deepgram for STT and TTS
   - Configured Twilio integration
   - Valid account SID and API key
2. GPT-4 Mini API access
3. Node.js 14+ installed

## Setup

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/jambonz-ai-calling.git
   cd jambonz-ai-calling
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file with your configuration:
   ```
   JAMBONZ_ACCOUNT_SID=your_account_sid
   JAMBONZ_API_KEY=your_api_key
   JAMBONZ_REST_API_BASE_URL=your_jambonz_base_url
   GPT4_MINI_API_KEY=your_gpt4_mini_key
   PORT=3000
   WEBHOOK_SECRET=your_webhook_secret
   LOG_LEVEL=info
   ```

4. Update the GPT4_MINI_API_URL in app.js with the correct endpoint.

## Running the Application

1. Start the server:
   ```bash
   npm start
   ```

2. For development with auto-reload:
   ```bash
   npm run dev
   ```

## Configuring Jambonz

1. In your Jambonz portal, create a new application
2. Configure the webhooks:
   - Voice Call URL: `http://your-server:3000/inbound-call`
   - Status URL: `http://your-server:3000/outbound-call`
3. Make sure Deepgram STT and TTS are selected as vendors

## Making Calls

### Inbound Calls
- Call the phone number assigned to your Jambonz application
- The AI assistant will answer and engage in conversation

### Outbound Calls
- Use the Jambonz REST API to initiate outbound calls
- Example using curl:
  ```bash
  curl -X POST \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_API_KEY" \
    -d '{
      "from": "+1234567890",
      "to": "+1987654321",
      "webhook_url": "http://your-server:3000/outbound-call"
    }' \
    https://your-jambonz-instance/v1/Accounts/YOUR_ACCOUNT_SID/Calls
  ```

## Architecture

The application uses:
- Express.js for the web server
- @jambonz/node-client for Jambonz integration
- Deepgram (via Jambonz) for STT/TTS
- GPT-4 Mini for natural language processing

## Error Handling

The application includes error handling for:
- Failed API calls to GPT-4 Mini
- Missing or invalid speech input
- Server errors
- Invalid webhooks

## Contributing

Feel free to submit issues and pull requests.

## License

MIT 