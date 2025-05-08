require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// WhatsApp API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Menu structure
const menus = {
    main: {
        message: "Please select an option:\n1. Option A\n2. Option B\n3. Option C",
        options: {
            "1": "a",
            "2": "b",
            "3": "c"
        }
    },
    a: {
        message: "You selected Option A. Please choose:\n1. Option C\n2. Option J",
        options: {
            "1": "c",
            "2": "j"
        }
    },
    b: {
        message: "You selected Option B. Please choose:\n1. Option K\n2. Option L",
        options: {
            "1": "k",
            "2": "l"
        }
    },
    c: {
        message: "You selected Option C. Please choose:\n1. Option W\n2. Option T",
        options: {
            "1": "w",
            "2": "t"
        }
    }
};

// User session storage
const userSessions = new Map();

// Function to send WhatsApp message
async function sendWhatsAppMessage(to, message) {
    try {
        const response = await axios.post(
            WHATSAPP_API_URL,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: { body: message }
            },
            {
                headers: {
                    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Message sent successfully:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error sending WhatsApp message:', error.response?.data || error.message);
        throw error;
    }
}

// Function to handle menu navigation
function handleMenuNavigation(userId, message) {
    let currentMenu = userSessions.get(userId) || 'main';
    let response = '';

    // Check if user wants to go back to main menu
    if (message.toLowerCase() === 'menu' || message.toLowerCase() === 'main') {
        userSessions.set(userId, 'main');
        return menus.main.message;
    }

    // Get the current menu options
    const currentMenuOptions = menus[currentMenu]?.options;
    
    if (currentMenuOptions) {
        const selectedOption = currentMenuOptions[message];
        if (selectedOption) {
            // If the selected option leads to another menu
            if (menus[selectedOption]) {
                userSessions.set(userId, selectedOption);
                response = menus[selectedOption].message;
            } else {
                // Handle final options (w, t, j, k, l)
                response = `You selected ${selectedOption.toUpperCase()}. Thank you for your selection! Type 'menu' to return to the main menu.`;
                userSessions.set(userId, 'main');
            }
        } else {
            response = `Invalid option. Please select from the available options or type 'menu' to return to the main menu.`;
        }
    } else {
        response = menus.main.message;
        userSessions.set(userId, 'main');
    }

    return response;
}

// Webhook verification endpoint
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
            console.log('Webhook verified!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// Webhook for receiving messages
app.post('/webhook', async (req, res) => {
    try {
        const { body } = req;

        if (body.object) {
            if (
                body.entry &&
                body.entry[0].changes &&
                body.entry[0].changes[0] &&
                body.entry[0].changes[0].value.messages &&
                body.entry[0].changes[0].value.messages[0]
            ) {
                const phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
                const from = body.entry[0].changes[0].value.messages[0].from;
                const msg_body = body.entry[0].changes[0].value.messages[0].text.body;

                console.log('Received message:', msg_body, 'from:', from);

                // Handle menu navigation
                const response = handleMenuNavigation(from, msg_body);
                await sendWhatsAppMessage(from, response);
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.sendStatus(500);
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 