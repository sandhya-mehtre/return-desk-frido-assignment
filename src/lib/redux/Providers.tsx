"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { useAppDispatch, useAppSelector } from "./hooks";
import { hydrateSeedData } from "./requestsSlice";
import { generateSeedRequests } from "./seedData";

function SeedLoader({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const items = useAppSelector((state) => state.requests.items);

  useEffect(() => {
    if (items.length === 0) {
      dispatch(hydrateSeedData(generateSeedRequests()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export default function ReduxProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SeedLoader>{children}</SeedLoader>
      </PersistGate>
    </Provider>
  );
}