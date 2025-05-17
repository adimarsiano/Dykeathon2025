import { getUserState } from "./userState";
import { menus } from "./config/menus";
import { INVALID_INPUT_MESSAGE } from "./config/texts";
import { runFlowStep } from "./responsesToUser/runFlowStep";
import { goToMenu, MAIN_MENU } from "./responsesToUser/goToMenu";
import { sendTextMessage } from "./responsesToUser/sendTextMessage";

export function handleMessage(
  userId: string,
  message: string
): { type: "menu" | "message"; text: string } {
  const state = getUserState(userId);

  console.log({ xxxxxx: state });
  if (state?.flow) {
    const { id: flowId, stepIndex } = state.flow;

    return runFlowStep({
      flowId,
      stepIndex,
      userId,
      message,
      state,
    });
  }

  const menu = menus[state?.menu ?? ""];

  if (!state || !menu) {
    return goToMenu({ userId, menuKey: MAIN_MENU });
  }

  const chosenOption = menu?.options?.find(({ key }) => key === message.trim());

  if (!chosenOption) {
    return { type: "menu", text: INVALID_INPUT_MESSAGE };
  }

  const { nextFlow, nextMenu, textMessage } = chosenOption;

  if (nextFlow) {
    return runFlowStep({
      flowId: nextFlow,
      stepIndex: 0,
      userId,
      message,
      state,
    });
  }

  if (nextMenu) {
    return goToMenu({ userId, menuKey: nextMenu });
  }

  if (textMessage) {
    return sendTextMessage(textMessage);
  }

  console.error(
    "Invalid option. The configuration is wrong",
    chosenOption,
    menu,
    userId,
    message
  );

  return goToMenu({ userId, menuKey: MAIN_MENU });
}
