import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Validate configuration
if (!WHATSAPP_TOKEN) {
  throw new Error("WHATSAPP_TOKEN is not set in environment variables");
}
if (!WHATSAPP_PHONE_NUMBER_ID) {
  throw new Error(
    "WHATSAPP_PHONE_NUMBER_ID is not set in environment variables"
  );
}

const WHATSAPP_API_URL = `https://graph.facebook.com/v22.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

// Function to send WhatsApp message
export const sendMessage = async (
  to: string,
  message: string,
  isInteractive = false,
  interactiveData: any = null
): Promise<any> => {
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

    console.log("Sending message to WhatsApp API:", {
      url: WHATSAPP_API_URL,
      phoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
      messageType: messageData.type,
    });

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
};
