import { menus } from "../config/menus";
import { updateUserState } from "../userState";

export const MAIN_MENU = "main";
export type MenuResponse = { type: "menu"; text: string };

export const goToMenu = ({
  userId,
  menuKey,
}: {
  userId: string;
  menuKey: string;
}): MenuResponse => {
  updateUserState(userId, { menu: menuKey });

  return { type: "menu" as const, text: menus[menuKey].prompt };
};
