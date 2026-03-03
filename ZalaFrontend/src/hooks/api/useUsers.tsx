import React, { useEffect, useRef, useState } from "react";
import { AUserToIUser, type IUser } from "../../interfaces";
import { stringify } from "../../utils";
import { useApi } from "./useApi";

export const useUsers = ({
  userIds = [],
  deps = [],
}: {
  userIds?: number[];
  deps?: unknown[];
}): [
  IUser[],
  React.Dispatch<React.SetStateAction<IUser[]>>,
  (userId: number) => Promise<void>,
  React.RefObject<IUser[]>,
  boolean,
] => {
  const api = useApi();

  const usersRef = useRef<IUser[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getUsers();
  }, [stringify(userIds), ...deps]);

  const getUsers = async () => {
    // TODO: Bug in this api route
    setLoading(true);
    const res = await api.getUsers();
    setLoading(false);

    if (res.data) {
      const props = res.data
        .map(AUserToIUser)
        .filter((user) =>
          userIds.length === 0 ? true : userIds.includes(user.userId),
        );
      setUsers(props);
      usersRef.current = props;
    }
  };

  return [users, setUsers, getUsers, usersRef, loading];
};
