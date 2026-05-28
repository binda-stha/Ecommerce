import { createContext, useContext, useReducer, useEffect } from "react";
import axios from "axios";

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  isLoading: true,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGOUT: "LOGOUT",
  LOAD_USER: "LOAD_USER",
  SET_LOADING: "SET_LOADING",
  AUTH_ERROR: "AUTH_ERROR",
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      localStorage.setItem("token", action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOAD_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case AUTH_ACTIONS.LOGOUT:
    case AUTH_ACTIONS.AUTH_ERROR:
      localStorage.removeItem("token");
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Set up axios defaults
const API_URL = "http://localhost:5001/api"; // Force correct port
console.log("🔗 API URL configured:", API_URL);
axios.defaults.baseURL = API_URL;

// Set auth token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set token on initial load
  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
      loadUser();
    } else {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }
  }, []);

  // Load user from token
  const loadUser = async () => {
    try {
      const res = await axios.get("/auth/me");
      dispatch({
        type: AUTH_ACTIONS.LOAD_USER,
        payload: res.data.user,
      });
    } catch (error) {
      console.error("Load user error:", error);
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      const res = await axios.post("/auth/login", { email, password });

      setAuthToken(res.data.token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: res.data.token,
          user: res.data.user,
        },
      });

      return { success: true, data: res.data };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });

      // Prepare registration data for backend (do NOT delete firstName/lastName)
      const transformedData = {
        ...userData,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        role: userData.role || "customer",
      };
      // Only remove confirmPassword (not firstName/lastName)
      delete transformedData.confirmPassword;

      console.log("🚀 Sending registration data:", transformedData);

      const res = await axios.post("/auth/register", transformedData);

      setAuthToken(res.data.token);
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          token: res.data.token,
          user: res.data.user,
        },
      });

      return { success: true, data: res.data };
    } catch (error) {
      console.error("❌ Registration error:", error);
      dispatch({ type: AUTH_ACTIONS.AUTH_ERROR });

      let message = "Registration failed";
      if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        message =
          error.response.data.errors[0].msg ||
          error.response.data.errors[0].message;
      } else if (error.message) {
        message = error.message;
      }

      return { success: false, message };
    }
  };

  // Logout user
  const logout = () => {
    setAuthToken(null);
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
