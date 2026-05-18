import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { getCurrentUser } from "./features/auth/authSlice";
import { initializeTheme } from "./features/theme/themeSlice";

const App = () => {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeTheme());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      dispatch(getCurrentUser());
    }
  }, [accessToken, dispatch, isAuthenticated]);

  return <AppRoutes />;
};

export default App;
