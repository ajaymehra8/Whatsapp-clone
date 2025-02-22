export const createChat = (chats: any, userId: string) => {
    if(!chats || chats?.length<1){
      return [];
    }
  return (chats.map((chat:any) => {
    let otherUser =
      chat.users[0]._id === userId ? chat.users[1] : chat.users[0];
    return {
      _id:chat._id,
      userId:otherUser._id,
      name: otherUser.name,
      image: otherUser.image,
      topMessage: chat.topMessage,
      lastSeen:chat.lastSeen||"not",
      count:chat.count||0
    };
  }));
};
