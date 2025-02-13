import { create } from 'zustand'

const useStore = create((set) => ({
  login:null,
  setLogin:(login)=>set({login}),
}))

export default useStore;