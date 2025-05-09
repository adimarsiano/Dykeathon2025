# Setup

terminal 0: ngrok http 3888
terminal 1: npm run build && npm run save

# WhatsApp Business Bot

A Node.js application that implements a WhatsApp Business Bot for handling customer interactions.

## Features

- Automated responses to customer messages
- Webhook integration with WhatsApp Business API
- Basic message handling for common queries
- Easy to extend and customize

## Prerequisites

- Node.js (v14 or higher)
- WhatsApp Business Account
- Meta Developer Account
- Access to WhatsApp Business API

## Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your WhatsApp Business API credentials:
   - `WHATSAPP_TOKEN`: Your WhatsApp Business API token
   - `WHATSAPP_PHONE_NUMBER_ID`: Your WhatsApp Business phone number ID
   - `WHATSAPP_VERIFY_TOKEN`: A custom token for webhook verification

## Configuration

1. Go to [Meta Developer Portal](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Set up WhatsApp in your app
4. Configure your webhook URL (must be HTTPS)
5. Get your API credentials and update the `.env` file

## Running the Application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## Webhook Setup

1. Your server must be accessible via HTTPS
2. Set up the webhook URL in the Meta Developer Portal
3. Use the verification token you set in your `.env` file

## Message Handling

The bot currently handles these types of messages:

- Greetings (hello, hi)
- Price inquiries
- Business hours
- Default response for other messages

You can extend the message handling logic in `src/index.js` to add more features.

## Security

- Never commit your `.env` file
- Keep your API tokens secure
- Use HTTPS for your webhook endpoint
- Implement rate limiting for production use

## License

MIT

# Dykeathon2025
