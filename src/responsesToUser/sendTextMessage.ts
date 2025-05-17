export type TextResponse = { type: "message"; text: string };

export const sendTextMessage = (text: string): TextResponse => {
  return { type: "message" as const, text };
};
