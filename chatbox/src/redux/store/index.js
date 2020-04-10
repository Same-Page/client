import { createStore } from "redux"
import rootReducer from "../reducers/index"
const store = createStore(rootReducer)
window.spStore = store
export default store
