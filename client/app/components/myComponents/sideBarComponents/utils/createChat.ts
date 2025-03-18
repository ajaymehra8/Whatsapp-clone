import { ChatType } from "@/app/types/allTypes";

export const createChat = (chats: any, userId: string) => {
  if (!chats || chats?.length < 1) {
    return [];
  }

  return chats.map((chat: any) => {
    let otherUser;
    if (!chat.isGroupedChat) {
      otherUser = chat.users[0]?._id === userId ? chat.users[1] : chat.users[0];
    } else {
      return {
        _id: chat?._id,
        name: chat.groupName,
        groupAdmin: chat.groupAdmin,
        image: chat.image,
        topMessage: chat.topMessage,
        count: chat.count || 0,
        isPinned: chat.isPinned,
        users: chat.users,
        isGroupedChat: chat.isGroupedChat,
      };
    }
    return {
      _id: chat?._id,
      userId: otherUser?._id,
      name: otherUser.name,
      image: otherUser.image,
      topMessage: chat.topMessage,
      lastSeen: otherUser.lastSeen,
      count: chat.count || 0,
      isPinned: chat.isPinned,
      users: chat.users,

      isGroupedChat: chat.isGroupedChat,
    };
  });
};
export const createSingleChat = (chat: any, userId: string | undefined) => {
  if (!chat) {
    return {};
  }
  let otherUser;
  if (!chat.isGroupedChat) {
    otherUser = chat.users[0]?._id === userId ? chat.users[1] : chat.users[0];
  } else {
    return {
      _id: chat?._id,
      name: chat.groupName,
      groupAdmin: chat.groupAdmin,
      users: chat.users,

      image: chat.image,
      topMessage: chat.topMessage,
      count: chat.count || 0,
      isPinned: chat.isPinned,
      isGroupedChat: chat.isGroupedChat,
    };
  }

  return {
    _id: chat?._id,
    userId: otherUser?._id,
    name: otherUser.name,
    image: otherUser.image,
    users: chat.users,

    topMessage: chat.topMessage,
    lastSeen: otherUser.lastSeen,
    count: chat.count || 0,
    isGroupedChat: chat.isGroupedChat,
  };
};
export const createGroupChat = (chat: any):ChatType|null => {
  if (!chat && !chat.isGroupedChat) {
    return null;
  }

  return {
    _id: chat?._id,
    name: chat.groupName,
    groupAdmin: chat.groupAdmin,
    image: chat.image,
    topMessage: chat.topMessage,
    users: chat.users,
    count: chat.count || 0,
    isGroupedChat: chat.isGroupedChat,
    messages: chat.messages,
  };
};
