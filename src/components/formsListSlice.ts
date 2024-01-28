import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { personalDetails } from "./RegistrationForm"


const initialState: personalDetails[] = []
export const formListSlice = createSlice({
    name: 'Form_List',
    initialState,
    reducers: {
        addToList: (state, action: PayloadAction<personalDetails>) => {
            state.push(action.payload)
        }
    }
})

export const { addToList } = formListSlice.actions
export default formListSlice.reducer