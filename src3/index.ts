import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { WebhookBody, WhatsAppMessage } from "./types";
import { handleMessage } from "./handleMessage";
import { sendMessage } from "./sendMessage";

import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

const extractMessage = (messageObject: WhatsAppMessage) => {
  const isTextMessage = messageObject.type === "text" && messageObject.text;
  const isButtonClick =
    messageObject.type === "interactive" &&
    messageObject.interactive?.type === "button_reply";

  if (isTextMessage) {
    return messageObject.text?.body || "";
  } else if (isButtonClick) {
    return messageObject.interactive?.button_reply?.id || "menu";
  }

  return "menu";
};

// Webhook for receiving messages
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    const body = req.body as WebhookBody;

    if (body.object) {
      const messageObject = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

      if (!messageObject) {
        res.sendStatus(200);
        return;
      }

      const message = extractMessage(messageObject);
      const from = messageObject.from;

      console.log("Received message:", message, "from:", from);

      const { response, isInteractive, interactiveData } = handleMessage(
        from,
        message
      );

      await sendMessage(from, response, isInteractive, interactiveData);

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
