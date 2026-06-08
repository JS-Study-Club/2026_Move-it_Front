import axios from "axios";
import { api } from "./axios";

interface UserData {
  username: string;
  level: number;
  levelXp: number;
  levelTitle: String;
}

const fetchUserData = async () => {
  // try {
  //   const response = await axios.get("http://localhost:8080/user/me", {
  //     withCredentials: true,
  //   });

  //   if (response.status === 200) {
  //     setUserData(response.data);
  //   }
  // } catch (error: any) {
  //   console.log("유저정보 불러오기 실패", error);
  //   if (error.response?.status === 401) {
  //     //TODO : refresh 조진다
  //     alert("로그인 만료");
  //   }
  // }
  try{
    const response = await api.get
  }
};

const fetchMyProfile = async (): Promise<UserData> => {
  const response = await api.get("/user/me");
  return response.data;
}
