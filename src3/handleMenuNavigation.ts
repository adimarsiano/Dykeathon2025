import { MenuResponse, UserInfo } from "./types";
import { menus, renderMenu } from "./menus";
import type { questionAndAnswers as qaType } from "./menus";

// User session storage
const userInfoMap = new Map<string, UserInfo>();

// Track where each user is in the menu
const userMenuMap = new Map<string, string>();

// Import questionAndAnswers as Record<string, string>
import { questionAndAnswers } from "./menus";
const qa: Record<string, string> = questionAndAnswers;

export const handleMenuNavigation = (
  userId: string,
  message: string
): MenuResponse => {
  let response = "";
  let isInteractive = false;
  let interactiveData = null;
  let userInfo: UserInfo | undefined = userInfoMap.get(userId);

  // Check if user wants to go back to main menu
  if (message.toLowerCase() === "menu" || message.toLowerCase() === "main") {
    userInfoMap.delete(userId);
    userMenuMap.set(userId, "main");
    response = renderMenu(menus.main);
    return { response, isInteractive, interactiveData };
  }

  // Handle user information collection
  if (userInfo?.state === "collecting_name") {
    userInfo.name = message;
    userInfo.state = "collecting_reason";
    userInfoMap.set(userId, userInfo);
    response = "בבקשה הכנס את הסיבה לפנייתך:";
    return { response, isInteractive, interactiveData, userInfo };
  }

  if (userInfo?.state === "collecting_reason") {
    userInfo.reason = message;
    userInfo.state = "completed";
    userInfoMap.set(userId, userInfo);

    // Log the collected information
    console.log("User Information:");
    console.log("Name:", userInfo.name);
    console.log("Reason:", userInfo.reason);
    console.log("Phone:", userId);

    response =
      "תודה! נציג שלנו יצור איתך קשר בהקדם. הקלד 'menu' לחזרה לתפריט הראשי.";
    userInfoMap.delete(userId);
    return { response, isInteractive, interactiveData, userInfo };
  }

  // Get current menu for user, default to main
  const currentMenuKey = userMenuMap.get(userId) || "main";
  const currentMenu = menus[currentMenuKey];

  // Try to parse the message as a number
  const selectedIndex = parseInt(message.trim(), 10) - 1;
  if (
    !isNaN(selectedIndex) &&
    currentMenu.options &&
    selectedIndex >= 0 &&
    selectedIndex < currentMenu.options.length
  ) {
    const selectedOption = currentMenu.options[selectedIndex];
    // If the selected option leads to another menu
    if (menus[selectedOption.id]) {
      userMenuMap.set(userId, selectedOption.id);
      response = renderMenu(menus[selectedOption.id]);
      return { response, isInteractive, interactiveData };
    }
    // If the selected option is a question with an answer
    if (qa[selectedOption.id]) {
      response = qa[selectedOption.id];
      return { response, isInteractive, interactiveData };
    }
    // If the selected option is human representative
    if (selectedOption.id === "humanRepresentativeQuestions") {
      userInfo = {
        state: "collecting_name",
      };
      userInfoMap.set(userId, userInfo);
      response = "בבקשה הכנס את שמך:";
      return { response, isInteractive, interactiveData, userInfo };
    }
  } else if (currentMenu.options && currentMenu.options.length > 0) {
    // If input is not a valid number for the current menu
    response = "Please try again";
    return { response, isInteractive, interactiveData };
  }

  // Default: show main menu
  userMenuMap.set(userId, "main");
  response = renderMenu(menus.main);
  return { response, isInteractive, interactiveData };
};
