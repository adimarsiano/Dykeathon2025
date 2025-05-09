import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import axios from "axios";
import { Menus, MenuResponse, WebhookBody, WhatsAppMessage } from "./types";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

// WhatsApp API configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Menu structure
const menus: Menus = {
  main: {
    header: "שלום לך יא זבל",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "organizationQuestions", title: "שאלות על הארגון" },
      { id: "processQuestions", title: "שאלות על תהליך הגיוס" },
      { id: "humanRepresentativeQuestions", title: "מעבר לנציג אנושי" },
    ],
  },
  organizationQuestions: {
    header: "שאלות על הארגון",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "organizationQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "organizationQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "organizationQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
  processQuestions: {
    header: "שאלות על תהליך הגיוס",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "processQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "processQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "processQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
  humanRepresentativeQuestions: {
    header: "מעבר לנציג אנושי",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "humanRepresentativeQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "humanRepresentativeQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "humanRepresentativeQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
};

const questionIdToAnswer = {
  organizationQuestions_1: "תשובה אל שאלת ארגון 1",
  organizationQuestions_2: "תשובה אל שאלת ארגון 2",
  organizationQuestions_3: "תשובה אל שאלת ארגון 3",
  processQuestions_1: "תשובה אל שאלת תהליך 1",
  processQuestions_2: "תשובה אל שאלת תהליך 2",
  processQuestions_3: "תשובה אל שאלת תהליך 3",
  humanRepresentativeQuestions_1: "תשובה אל שאלת נציג אנושי 1",
  humanRepresentativeQuestions_2: "תשובה אל שאלת נציג אנושי 2",
  humanRepresentativeQuestions_3: "תשובה אל שאלת נציג אנושי 3",
};

// User session storage
const userSessions = new Map<string, string>();

// Function to send WhatsApp message
async function sendWhatsAppMessage(
  to: string,
  message: string,
  isInteractive = false,
  interactiveData: any = null
): Promise<any> {
  try {
    const messageData: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
    };

    if (isInteractive) {
      messageData.type = "interactive";
      messageData.interactive = {
        type: "button",
        header: { type: "text", text: interactiveData.header },
        body: { text: interactiveData.body },
        action: {
          buttons: interactiveData.buttons.map((button: any) => ({
            type: "reply",
            reply: {
              id: button.id,
              title: button.title,
            },
          })),
        },
      };
    } else {
      messageData.type = "text";
      messageData.text = { body: message };
    }

    const response = await axios.post(WHATSAPP_API_URL, messageData, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Message sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending WhatsApp message:",
      error.response?.data || error.message
    );
    throw error;
  }
}

function handleMenuNavigation(userId: string, message: string): MenuResponse {
  let response = "";
  let isInteractive = true;
  let interactiveData = null;

  const selectedButton = Object.values(menus)
    .flatMap((menu) => menu.buttons)
    .find((button) => button.id === message);

  if (selectedButton) {
    const { id: buttonId } = selectedButton;
    const nextMenu = menus[buttonId];

    if (nextMenu) {
      interactiveData = nextMenu;
    } else {
      response =
        questionIdToAnswer[buttonId as keyof typeof questionIdToAnswer] ??
        "תשובה לא קיימת";
      isInteractive = false;
    }
  } else {
    interactiveData = menus.main;
  }

  return { response, isInteractive, interactiveData };
}

// Webhook verification endpoint
app.get("/webhook", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log("Webhook verified!");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

const isButtonClick = (message: WhatsAppMessage) => {
  return (
    message.type === "interactive" &&
    message.interactive?.type === "button_reply"
  );
};

// Webhook for receiving messages
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    const body = req.body as WebhookBody;

    if (body.object) {
      const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!message) {
        res.sendStatus(200);
        return;
      }

      const from = message.from;
      const buttonId = isButtonClick(message)
        ? message.interactive?.button_reply?.id || "menu"
        : "menu";

      console.log("Received message:", buttonId, "from:", from);

      const { response, isInteractive, interactiveData } = handleMenuNavigation(
        from,
        buttonId
      );

      await sendWhatsAppMessage(from, response, isInteractive, interactiveData);

      res.sendStatus(200);
    } else {
      res.sendStatus(404);
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
