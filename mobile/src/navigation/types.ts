import { ChatRoom } from '../types';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Chat: { room: ChatRoom };
};

export type MainTabParamList = {
  Home: undefined;
  Clinical: undefined;
  Medications: undefined;
  Chats: undefined;
  Profile: undefined;
};
