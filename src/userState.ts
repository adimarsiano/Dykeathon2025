export type UserState = {
  userId: string;
  menu?: string;
  flow?: {
    id: string;
    stepIndex: number;
  };
  userDetails?: {
    name?: string;
    phoneNumber?: string;
  };
};

type UserId = string;
let usersStates: Map<UserId, UserState> | undefined;

const getUsersStates = () => {
  if (usersStates === undefined) {
    usersStates = new Map<UserId, UserState>();
  }

  return usersStates;
};

export const resetUserState = (userId: string) => {
  getUsersStates().set(userId, { userId });
};

export const updateUserState = (userId: string, update: Partial<UserState>) => {
  const usersStates = getUsersStates();

  usersStates.set(userId, {
    ...(usersStates.get(userId) ?? { userId }),
    ...update,
  });
};

export const getUserState = (userId: string) => {
  const usersStates = getUsersStates();

  return usersStates.get(userId);
};
