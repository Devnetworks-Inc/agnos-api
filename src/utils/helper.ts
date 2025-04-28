import { Prisma, user_role } from "@prisma/client"
import jwt from 'jsonwebtoken'
import { RateType } from "src/modules/employee/schema";

export type CreateJwtTokenParams = {
  id: number;
  username: string;
  role: user_role;
  currentHotelId?: number | null;
}

export const createJwtToken = (data: CreateJwtTokenParams) => {
  const { id, username, role, currentHotelId } = data
  const jwtSecret = process.env.JWT_SECRET || ''
  return jwt.sign({ id, username, role, currentHotelId }, jwtSecret)
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

export const isoStringRemoveTime = (isoString: string) => {
  return isoString.split('T')[0]
}

export const getHourlyRate = (rateType: RateType, rateAmount: number) => {
  let rate = new Prisma.Decimal(rateAmount)
  let hourlyRate = rate;

  switch (rateType) {
    case 'hourly': break;
    case 'daily':
      hourlyRate = rate.dividedBy(8.4); // Assuming 8.4 working hours per day
      break;
    case 'weekly':
      hourlyRate = rate.dividedBy(42); // Assuming 5 days/week * 8.4 hours = 42 hours
      break;
    case '15days':
      hourlyRate = rate.dividedBy(84);
      break;
    // case 'biweekly':
    //   hourlyRate = rate.dividedBy(84); // 10 working days * 8.4 hours = 84 hours
    //   break;
    case 'monthly':
      hourlyRate = rate.dividedBy(168); // 20 working days * 8.4 hours = 160 hours
      break;
    default:
      throw new Error('Invalid rate type');
  }

  return hourlyRate;
}

export const calculateSalary = (hourlyRate: number | Prisma.Decimal, secondsWork: number ) => {
  let totalHoursWorked = new Prisma.Decimal(secondsWork).dividedBy(3600)
  return totalHoursWorked.times(hourlyRate)
}
