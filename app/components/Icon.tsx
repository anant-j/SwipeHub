import React from "react";
import { Feather } from '@expo/vector-icons';
import { IconT } from "../types";

const Icon = ({ color, name, size, style }: IconT) => (
  <Feather name={name} size={size} color={color} style={style} />
);

export default Icon;
