type MenuOption = {
  key: string;
  text: string;
  nextMenu?: string;
  response?: string;
};

type Menu = {
  prompt: string;
  options: MenuOption[];
};

type Menus = {
  [menuKey: string]: Menu;
};

export const MENUS: Menus = {
  main: {
    prompt: `Choose option:\n1. questions\n2. choose Nuka\n3. Contact`,
    options: [
      { key: "1", text: "questions", nextMenu: "questionsMenu" },
      { key: "2", text: "choose Nuka", response: "nice choose 2 yay" },
      { key: "3", text: "Contact", response: "nice choose 3 baba" },
    ],
  },
  questionsMenu: {
    prompt: `Questions:\n1. What is Nuka?\n2. Back`,
    options: [
      { key: "1", text: "What is Nuka?", response: "Nuka is awesome!" },
      { key: "2", text: "חזרה לתפריט הקודם", nextMenu: "main" },
    ],
  },
};
