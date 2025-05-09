import { MenuResponse, UserInfo } from "./types";
import { menus, questionAndAnswers } from "./menus";

// User session storage
const userInfoMap = new Map<string, UserInfo>();

export const handleMenuNavigation = (
  userId: string,
  message: string
): MenuResponse => {
  let response = "";
  let isInteractive = true;
  let interactiveData = null;
  let userInfo: UserInfo | undefined = userInfoMap.get(userId);

  // Check if user wants to go back to main menu
  if (message.toLowerCase() === "menu" || message.toLowerCase() === "main") {
    userInfoMap.delete(userId);
    interactiveData = menus.main;
    return { response, isInteractive, interactiveData };
  }

  // Handle user information collection
  if (userInfo?.state === "collecting_name") {
    userInfo.name = message;
    userInfo.state = "collecting_reason";
    userInfoMap.set(userId, userInfo);
    response = "בבקשה הכנס את הסיבה לפנייתך:";
    isInteractive = false;
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
    isInteractive = false;
    userInfoMap.delete(userId);
    return { response, isInteractive, interactiveData, userInfo };
  }

  const selectedButton = Object.values(menus)
    .flatMap((menu) => menu.buttons)
    .find((button) => button.id === message);

  if (selectedButton) {
    const { id: buttonId } = selectedButton;

    // Handle human representative request
    if (buttonId === "humanRepresentativeQuestions") {
      userInfo = {
        state: "collecting_name",
      };
      userInfoMap.set(userId, userInfo);
      response = "בבקשה הכנס את שמך:";
      isInteractive = false;
      return { response, isInteractive, interactiveData, userInfo };
    }

    // Handle organization questions
    if (buttonId === "organizationQuestions") {
      response =
        "*על הארגון שלנו:*\n\nיש איתנו אנשים ונשים מכל קשת המפה הפוליטית. אנחנו מאמינים שחילוקי דעות הם בריאים במסגרת דמוקרטית.\n\n_המסגרת שלנו_ מאפשרת ייצוג טוב יותר ושיתוף רב יותר של אוכלוסיות שונות בתהליכי קבלת ההחלטות.\n\n*אנו מקדמים נושאים* שאנו יכולים להסכים עליהם ועובדים עם כל הממשלות בעשור האחרון.";
      isInteractive = false;
      return { response, isInteractive, interactiveData };
    }

    // Handle process questions navigation
    if (buttonId === "processQuestions") {
      interactiveData = menus.processQuestions;
      return { response, isInteractive, interactiveData };
    }

    if (buttonId === "processQuestions_3") {
      // After the last question in processQuestions, show processQuestions2
      interactiveData = menus.processQuestions2;
      return { response, isInteractive, interactiveData };
    }

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

  return { response, isInteractive, interactiveData, userInfo };
};
