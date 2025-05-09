import dotenv from "dotenv";
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { WebhookBody, WhatsAppMessage } from "./types";
import { handleMenuNavigation } from "./handleMenuNavigation";
import { sendMessage } from "./sendMessage";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());

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

      const { response, isInteractive, interactiveData } =
        handleMenuNavigation(from);

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
