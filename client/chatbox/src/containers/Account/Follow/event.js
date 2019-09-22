// If user follow/unfollow anyone, it will call
// follow method, the Follow.js component can 'subscribe'
// to it by providing a definition of the function

const followEventHandler = {
  follow: () => {
    console.log("follow not mounted")
  }
}

export default followEventHandler
