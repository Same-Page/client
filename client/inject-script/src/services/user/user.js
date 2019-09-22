const _userCache = {} // id -> user data mapping
// only use case of this cache is
// caching user data of users in a chatroom
// so that we can lookup user data when a user
// send a message in the chatroom
export const addUserToCache = user => {
  _userCache[user.id] = user
}
export const getUserFromCache = userId => {
  // shouldn't ever be cache miss if only above use case
  return _userCache[userId]
}
