import { MENUS } from "./menus";

const goToMenu = ({ userId, menuKey }: { userId: string; menuKey: string }) => {
  userState.set(userId, { menu: menuKey });

  return { type: "menu" as const, text: MENUS[menuKey].prompt };
};

const sendTextMessage = (text: string) => {
  return { type: "message" as const, text };
};

const userState = new Map<string, { menu: string }>();

const INVALID_INPUT_MESSAGE = "אנא בחר באפשרות מהתפריט";
const MAIN_MENU = "main";

export function handleMessageAndGetResponse(
  userId: string,
  message: string
): { type: "menu" | "message"; text: string } {
  const state = userState.get(userId);

  if (!state) {
    return goToMenu({ userId, menuKey: MAIN_MENU });
  }

  const currentMenu = MENUS[state.menu];
  const chosenOption = currentMenu?.options?.find(
    ({ key }) => key === message.trim()
  );

  if (!chosenOption) {
    return { type: "menu", text: INVALID_INPUT_MESSAGE };
  }

  const { nextMenu, response } = chosenOption;

  if (nextMenu) {
    return goToMenu({ userId, menuKey: nextMenu });
  }

  if (response) {
    return sendTextMessage(response);
  }

  console.error("Invalid option", chosenOption, currentMenu, userId, message);

  return goToMenu({ userId, menuKey: MAIN_MENU });
}
