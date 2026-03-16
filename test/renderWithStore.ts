import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { Provider } from "react-redux";
import rootReducer from "../store/rootReducer";
import rootSaga from "../store/rootSaga";

export function renderWithStore(ui) {
  const actionLog: any[] = [];

  const actionLogger = () => next => action => {
    actionLog.push(action);
    return next(action);
  };

  const sagaMiddleware = createSagaMiddleware();

  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefault =>
      getDefault({ thunk: false }).concat(actionLogger, sagaMiddleware),
  });

  sagaMiddleware.run(rootSaga);

  return {
    store,
    actionLog,
    ...render(<Provider store={store}>{ui}</Provider>),
  };
}

const { store, actionLog } = renderWithStore(<AutoDispatch />);

test("dispatch fires and state updates", async () => {
  const { store, actionLog } = renderWithStore(<UserLoader />);

  fireEvent.click(screen.getByText("Load"));

  await waitFor(() => {
    expect(actionLog).toContainEqual({ type: "FETCH_USER", payload: 123 });
    expect(store.getState().user.data).toEqual({ name: "Pat" });
  });
});
