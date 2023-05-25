import React, { ReactNode } from "react";
import { useCookies } from "react-cookie";
import { Footer } from "../Footer";
import { NotFound } from "../NotFound";

interface Prop {
  condition?: () => boolean;
  children: ReactNode;
}

export const MerComponent: React.FC<Prop> = (props) => {
  const [cookies] = useCookies(["token", "userID"]);
  return (
    <>
      {props.children}
    </>
  );
};
