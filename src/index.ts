import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { handleMessage } from "./handleMessage";
import { sendMessage } from "./sendMessage";

const app = express();
const port = process.env.PORT || 3888;

app.use(bodyParser.json());

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

// Webhook for receiving messages
app.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("Received request:", req.body);
    // Try WhatsApp webhook structure
    let from = req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from;
    let message =
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body ||
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.button?.text ||
      req.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.interactive
        ?.button_reply?.title ||
      "";

    if (!from && req.body.from && req.body.message) {
      from = req.body.from;
      message = req.body.message;
    }

    if (!from || !message) {
      res.status(400).send("Missing 'from' or 'message'");
      return;
    }

    const response = await handleMessage(from, message);

    await sendMessage(from, response.text);

    res.json({ type: response.type, text: response.text });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.sendStatus(500);
  }
});

// Start server (only once)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
