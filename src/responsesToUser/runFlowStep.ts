import { resetUserState } from "../userState";
import { flows } from "../config/flows";
import { UserState } from "../userState";
import { updateUserState } from "../userState";
import { goToMenu, MAIN_MENU } from "./goToMenu";
import { sendTextMessage } from "./sendTextMessage";

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
  }) => {
    type: "message";
    text: string;
  }
> = {
  updateNameAndGetPhoneNumber: ({ userId, message, stepMessage }) => {
    updateUserState(userId, { userDetails: { name: message } });

    return sendTextMessage(stepMessage ?? "");
  },
  sendUserDetails: ({ userId, message, state, stepMessage }) => {
    updateUserState(userId, { userDetails: { phoneNumber: message } });

    const userName = state.userDetails?.name;
    const phoneNumber = message;

    // TODO: send details
    console.log("userDetails", userName, phoneNumber);

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

export const runFlowStep = ({
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
}): { type: "message"; text: string } | { type: "menu"; text: string } => {
  updateStepInState(userId, flowId, stepIndex);

  const stepConfig = flows[flowId][stepIndex];
  const { stepMessage, functionId } = stepConfig;

  const isTextMessage = stepMessage && !functionId;

  const response = isTextMessage
    ? sendTextMessage(stepMessage)
    : stepsFunctions[functionId ?? ""]?.({
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
