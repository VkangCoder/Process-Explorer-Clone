import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { login as loginApi } from "../api/auth";

interface AuthState {
    token: string | null;
    isLoggingIn: boolean;
    error: string | null;
}

const initialState: AuthState = {
    token: typeof window !== "undefined" ? localStorage.getItem("token") : null,
    isLoggingIn: false,
    error: null,
};

export const login = createAsyncThunk<string, { username: string; password: string }, { rejectValue: string }>(
    "auth/login",
    async ({ username, password }, { rejectWithValue }) => {
        const result = await loginApi(username, password);

        if (!result.ok) {
            return rejectWithValue(result.message);
        }

        localStorage.setItem("token", result.token);

        return result.token;
    },
);

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
            localStorage.removeItem("token");
            state.token = null;
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.isLoggingIn = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<string>) => {
                state.isLoggingIn = false;
                state.token = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoggingIn = false;
                state.error = action.payload ?? "Login Failed.";
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
