import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";

import {
  clearToasts,
  dismissToast,
  showToast,
} from "../features/toasts/toastSlice";

const useToast = () => {
  const dispatch = useDispatch();

  const show = useCallback(
    (payload) => dispatch(showToast(payload)),
    [dispatch],
  );

  const success = useCallback(
    (message, options = {}) =>
      show({
        ...options,
        type: "success",
        message,
      }),
    [show],
  );

  const error = useCallback(
    (message, options = {}) =>
      show({
        ...options,
        type: "error",
        message,
      }),
    [show],
  );

  const info = useCallback(
    (message, options = {}) =>
      show({
        ...options,
        type: "info",
        message,
      }),
    [show],
  );

  const warning = useCallback(
    (message, options = {}) =>
      show({
        ...options,
        type: "warning",
        message,
      }),
    [show],
  );

  const dismiss = useCallback(
    (toastId) => dispatch(dismissToast(toastId)),
    [dispatch],
  );

  const clear = useCallback(() => dispatch(clearToasts()), [dispatch]);

  return useMemo(
    () => ({
      clear,
      dismiss,
      error,
      info,
      show,
      success,
      warning,
    }),
    [clear, dismiss, error, info, show, success, warning],
  );
};

export default useToast;
