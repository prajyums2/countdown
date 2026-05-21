"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

interface DevTimeContextType {
  devNow: Date | null;
  setDevNow: React.Dispatch<React.SetStateAction<Date | null>>;
  enabled: boolean;
  setEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  minDate: Date;
  maxDate: Date;
  setMinDate: React.Dispatch<React.SetStateAction<Date>>;
  setMaxDate: React.Dispatch<React.SetStateAction<Date>>;
}

const DevTimeContext = createContext<DevTimeContextType>({
  devNow: null,
  setDevNow: () => {},
  enabled: false,
  setEnabled: () => {},
  minDate: new Date(),
  maxDate: new Date(),
  setMinDate: () => {},
  setMaxDate: () => {},
});

export function DevTimeProvider({
  children,
  defaultMin,
  defaultMax,
}: {
  children: ReactNode;
  defaultMin?: Date;
  defaultMax?: Date;
}) {
  const [devNow, setDevNow] = useState<Date | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [minDate, setMinDate] = useState(defaultMin || new Date());
  const [maxDate, setMaxDate] = useState(defaultMax || new Date());

  return (
    <DevTimeContext.Provider
      value={{ devNow, setDevNow, enabled, setEnabled, minDate, maxDate, setMinDate, setMaxDate }}
    >
      {children}
    </DevTimeContext.Provider>
  );
}

export function useNow(): Date {
  const { devNow, enabled } = useContext(DevTimeContext);
  const [realNow, setRealNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setRealNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (enabled && devNow) return devNow;
  return realNow;
}

export function useDevTime() {
  return useContext(DevTimeContext);
}
