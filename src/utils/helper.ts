import { Prisma, user_role } from "@prisma/client"
import jwt from 'jsonwebtoken'

export type CreateJwtTokenParams = {
  id: number;
  username: string;
  role: user_role;
}

export const createJwtToken = (data: CreateJwtTokenParams) => {
  const { id, username, role } = data
  const jwtSecret = process.env.JWT_SECRET || ''
  return jwt.sign({ id, username, role }, jwtSecret)
}

export const decimalTypePropsToNumber = (obj: any) => {
  if (typeof obj !== 'object' || obj === null || obj === undefined || obj instanceof Date) {
    return obj;
  }
  else if (obj instanceof Prisma.Decimal) {
    return obj.toNumber()
  }
  else if (Array.isArray(obj)) {
    const newArray = [ ...obj]
    let index = 0
    for (let value of newArray) {
      newArray[index] = decimalTypePropsToNumber(value)
      index++
    }
    return newArray
  }

  const newObj = { ...obj }
  for (let key in newObj) {
    newObj[key] = decimalTypePropsToNumber(newObj[key]);
  }

  return newObj 
}