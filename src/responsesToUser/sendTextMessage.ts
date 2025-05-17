export const sendTextMessage = (text: string) => {
  return { type: "message" as const, text };
};
