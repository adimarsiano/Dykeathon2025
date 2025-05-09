import { MenuResponse } from "./types";
import { menus, questionAndAnswers } from "./menus";

export const handleMenuNavigation = (message: string): MenuResponse => {
  let response = "";
  let isInteractive = true;
  let interactiveData = null;

  const selectedButton = Object.values(menus)
    .flatMap((menu) => menu.buttons)
    .find((button) => button.id === message);

  if (selectedButton) {
    const { id: buttonId } = selectedButton;
    const nextMenu = menus[buttonId];

    if (nextMenu) {
      interactiveData = nextMenu;
    } else {
      response =
        questionAndAnswers[buttonId as keyof typeof questionAndAnswers] ??
        "תשובה לא קיימת";
      isInteractive = false;
    }
  } else {
    interactiveData = menus.main;
  }

  return { response, isInteractive, interactiveData };
};
