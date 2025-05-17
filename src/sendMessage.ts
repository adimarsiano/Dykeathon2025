import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

if (!WHATSAPP_TOKEN) {
  throw new Error("WHATSAPP_TOKEN is not set in environment variables");
}
if (!WHATSAPP_PHONE_NUMBER_ID) {
  throw new Error(
    "WHATSAPP_PHONE_NUMBER_ID is not set in environment variables"
  );
}

const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendMessage = async (
  to: string,
  message: string
): Promise<any> => {
  if (!message || typeof message !== "string" || message.trim() === "") {
    console.error("Attempted to send empty WhatsApp message body:", message);
    throw new Error("Cannot send empty WhatsApp message body.");
  }

  const messageData: any = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { body: message },
  };

  return sendMessageInner(messageData);
};

export const sendTemplate = async (
  to: string,
  templateName: string,
  parameters: string[]
): Promise<any> => {
  const messageData: any = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en_US" },
      components: [
        {
          type: "body",
          parameters: parameters.map((text) => ({ type: "text", text })),
        },
      ],
    },
  };

  return sendMessageInner(messageData);
};

const sendMessageInner = async (messageData: any) => {
  try {
    console.log("Sending template message to WhatsApp API:", {
      url: WHATSAPP_API_URL,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
      messageData,
    });

    const response = await axios.post(WHATSAPP_API_URL, messageData, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Template message sent successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error sending WhatsApp template message:",
      error.response?.data || error.message
    );
    throw error;
  }
};
