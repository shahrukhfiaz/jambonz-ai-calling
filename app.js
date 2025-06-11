const express = require('express');
const app = express();
const {WebhookResponse} = require('@jambonz/node-client');
const fetch = require('node-fetch');
const debug = require('debug')('jambonz:ai-calling-app');
const pino = require('pino')();
const logger = pino.child({module: 'app'});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// GPT-4 Mini API configuration
const GPT4_MINI_API_URL = 'https://api.gpt4mini.com/v1/chat'; // Replace with actual API endpoint

// Helper function to interact with GPT-4 Mini
async function getGPTResponse(prompt) {
  try {
    const response = await fetch(GPT4_MINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GPT4_MINI_API_KEY}`
      },
      body: JSON.stringify({
        messages: [{role: 'user', content: prompt}],
        temperature: 0.7,
        max_tokens: 150
      })
    });
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (err) {
    logger.error({err}, 'Error getting GPT response');
    return 'I apologize, but I encountered an error processing your request.';
  }
}

// Inbound call handler
app.post('/inbound-call', async (req, res) => {
  const {logger} = req.app.locals;
  logger.info({payload: req.body}, 'inbound call received');
  
  try {
    const webhook = new WebhookResponse();
    
    // Initial greeting
    webhook.say({text: 'Hello! I am an AI assistant. How can I help you today?'});
    
    // Start conversation loop
    webhook.gather({
      input: ['speech'],
      timeout: 5,
      actionHook: '/transcription',
      listenDuringPrompt: true,
      sttHints: ['help', 'question', 'goodbye'],
      sttTimeout: 2
    });
    
    res.status(200).json(webhook);
  } catch (err) {
    logger.error({err}, 'Error processing inbound call');
    res.sendStatus(503);
  }
});

// Transcription webhook handler
app.post('/transcription', async (req, res) => {
  const {logger} = req.app.locals;
  logger.info({payload: req.body}, 'transcription received');
  
  try {
    const {speech} = req.body;
    const webhook = new WebhookResponse();
    
    if (!speech || !speech.alternatives || !speech.alternatives[0]) {
      webhook.say({text: 'I did not hear anything. Could you please repeat?'});
      webhook.gather({
        input: ['speech'],
        timeout: 5,
        actionHook: '/transcription'
      });
      return res.status(200).json(webhook);
    }
    
    const userInput = speech.alternatives[0].transcript;
    
    // Get AI response
    const aiResponse = await getGPTResponse(userInput);
    
    // Respond to user
    webhook.say({text: aiResponse});
    
    // Continue conversation
    webhook.gather({
      input: ['speech'],
      timeout: 5,
      actionHook: '/transcription',
      listenDuringPrompt: true
    });
    
    res.status(200).json(webhook);
  } catch (err) {
    logger.error({err}, 'Error processing transcription');
    res.sendStatus(503);
  }
});

// Outbound call handler
app.post('/outbound-call', async (req, res) => {
  const {logger} = req.app.locals;
  logger.info({payload: req.body}, 'outbound call status update');
  
  try {
    const webhook = new WebhookResponse();
    
    if (req.body.event === 'answered') {
      // Call was answered - start the conversation
      webhook.say({text: 'Hello! This is an AI assistant calling. How can I help you today?'});
      webhook.gather({
        input: ['speech'],
        timeout: 5,
        actionHook: '/transcription',
        listenDuringPrompt: true
      });
    }
    
    res.status(200).json(webhook);
  } catch (err) {
    logger.error({err}, 'Error processing outbound call');
    res.sendStatus(503);
  }
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err, 'An error occurred');
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message
  });
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
}); 