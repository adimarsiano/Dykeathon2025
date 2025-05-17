import { resetUserState } from "../userState";
import { flows } from "../config/flows";
import { UserState } from "../userState";
import { updateUserState } from "../userState";
import { goToMenu, MAIN_MENU, MenuResponse } from "./goToMenu";
import { sendTextMessage, TextResponse } from "./sendTextMessage";
import { sendTemplate } from "../sendMessage";

import dotenv from "dotenv";
dotenv.config();

const PHONE_NUMBER_TO_SEND_NEW_CONTACTS =
  process.env.PHONE_NUMBER_TO_SEND_NEW_CONTACTS;

if (!PHONE_NUMBER_TO_SEND_NEW_CONTACTS) {
  throw new Error(
    "PHONE_NUMBER_TO_SEND_NEW_CONTACTS is not set in environment variables"
  );
}

const sendUserDetails = async ({
  userName,
  phoneNumber,
}: {
  userName: string;
  phoneNumber: string;
}) => {
  await sendTemplate(PHONE_NUMBER_TO_SEND_NEW_CONTACTS, "new_contact_2", [
    userName,
    phoneNumber,
  ]);
};

const stepsFunctions: Record<
  string,
  ({
    userId,
    message,
    state,
    stepMessage,
  }: {
    userId: string;
    message: string;
    state: UserState;
    stepMessage: string;
  }) => Promise<{
    type: "message";
    text: string;
  }>
> = {
  updateNameAndGetPhoneNumber: async ({ userId, message, stepMessage }) => {
    updateUserState(userId, { userDetails: { name: message } });

    return sendTextMessage(stepMessage ?? "");
  },
  sendUserDetails: async ({ userId, message, state, stepMessage }) => {
    updateUserState(userId, { userDetails: { phoneNumber: message } });

    await sendUserDetails({
      userName: state.userDetails?.name ?? "Unknown",
      phoneNumber: message,
    });

    return sendTextMessage(stepMessage ?? "");
  },
};

const updateStepInState = (
  userId: string,
  flowId: string,
  stepIndex: number
) => {
  updateUserState(userId, { flow: { id: flowId, stepIndex } });
};

export const runFlowStep = async ({
  flowId,
  userId,
  message,
  state,
  stepIndex,
}: {
  flowId: string;
  userId: string;
  message: string;
  state: UserState;
  stepIndex: number;
}): Promise<MenuResponse | TextResponse> => {
  updateStepInState(userId, flowId, stepIndex);

  const stepConfig = flows[flowId][stepIndex];
  const { stepMessage, functionId } = stepConfig;

  const isTextMessage = stepMessage && !functionId;

  const response = isTextMessage
    ? sendTextMessage(stepMessage)
    : await stepsFunctions[functionId ?? ""]?.({
        userId,
        message,
        state,
        stepMessage,
      });

  if (!response) {
    console.error("Invalid flow step");
    resetUserState(userId);

    return goToMenu({ userId, menuKey: MAIN_MENU });
  }

  const isLastStep = stepIndex === flows[flowId].length - 1;

  isLastStep
    ? resetUserState(userId)
    : updateUserState(userId, {
        flow: { id: flowId, stepIndex: stepIndex + 1 },
      });

  return response;
};
