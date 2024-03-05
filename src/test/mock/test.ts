import { NameCardInterface } from "@typechains";
import { faker } from "@faker-js/faker";
import { BigNumber } from "ethers";

export enum Team {
  DEV,
  RESEARCH,
}

export interface NameCardInfo {
  name: string;
  phoneNum: string;
  team: number;
  year: number;
}

export const mockNameCardInput = (data?: Partial<NameCardInfo>): NameCardInfo => {
  return {
    name: faker.name.fullName(),
    phoneNum: faker.phone.number(),
    team: faker.helpers.arrayElement([Team.DEV, Team.RESEARCH]),
    year: faker.datatype.number(5),
    ...data,
  };
};
