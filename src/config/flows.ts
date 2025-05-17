type Step = {
  stepMessage: string;
  functionId?: string;
};

export const getUserDetailsFlowId = "getUserDetails";

export const flows: Record<string, Step[]> = {
  [getUserDetailsFlowId]: [
    {
      stepMessage: "הכנס.י את שמך:",
    },
    {
      stepMessage: "הכנס.י את מספר הטלפון שלך:",
      functionId: "updateNameAndGetPhoneNumber",
    },
    {
      stepMessage: "תודה! נציג ייצור איתך קשר בהקדם.",
      functionId: "sendUserDetails",
    },
  ],
};
