import BaseService from "./BaseService";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";

const { access_token } = useContext(AuthContext).user;

const ListService = {
  getLists: () => {},

  createList: (list) => {
    return BaseService.post("/list", list, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
  },
};
