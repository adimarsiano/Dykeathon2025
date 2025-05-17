import { menus } from "../config/menus";
import { updateUserState } from "../userState";

export const MAIN_MENU = "main";

export const goToMenu = ({
  userId,
  menuKey,
}: {
  userId: string;
  menuKey: string;
}) => {
  updateUserState(userId, { menu: menuKey });

  return { type: "menu" as const, text: menus[menuKey].prompt };
};
