import { Menus } from "./types";

export const questionAndAnswers = {
  organizationQuestions_1: "תשובה אל שאלת ארגון 1",
  organizationQuestions_2: "תשובה אל שאלת ארגון 2",
  organizationQuestions_3: "תשובה אל שאלת ארגון 3",
  processQuestions_1: "תשובה אל שאלת תהליך 1",
  processQuestions_2: "תשובה אל שאלת תהליך 2",
  processQuestions_3: "תשובה אל שאלת תהליך 3",
  humanRepresentativeQuestions_1: "תשובה אל שאלת נציג אנושי 1",
  humanRepresentativeQuestions_2: "תשובה אל שאלת נציג אנושי 2",
  humanRepresentativeQuestions_3: "תשובה אל שאלת נציג אנושי 3",
};

export const menus: Menus = {
  main: {
    header: "שלום לך יא זבל",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "organizationQuestions", title: "שאלות על הארגון" },
      { id: "processQuestions", title: "שאלות על תהליך הגיוס" },
      { id: "humanRepresentativeQuestions", title: "מעבר לנציג אנושי" },
    ],
  },
  organizationQuestions: {
    header: "שאלות על הארגון",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "organizationQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "organizationQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "organizationQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
  processQuestions: {
    header: "שאלות על תהליך הגיוס",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "processQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "processQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "processQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
  humanRepresentativeQuestions: {
    header: "מעבר לנציג אנושי",
    body: "בבקשה בחר את האפשרות המתאימה לך",
    buttons: [
      { id: "humanRepresentativeQuestions_1", title: "מה אתה הכי אוהב?" },
      { id: "humanRepresentativeQuestions_2", title: "מה אתה הכי מכיר?" },
      { id: "humanRepresentativeQuestions_3", title: "מה אתה הכי שיש?" },
    ],
  },
};
