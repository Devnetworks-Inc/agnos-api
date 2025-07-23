import { Prisma, user_role } from "@prisma/client"
import jwt from 'jsonwebtoken'
import { Auth } from "src/modules/auth.schema";
import { RateType } from "src/modules/employee/schema";

export const createJwtToken = (data: Auth) => {
  const { id, username, role, currentHotelId, employeeId } = data
  const jwtSecret = process.env.JWT_SECRET || ''
  return jwt.sign({ id, username, role, currentHotelId, employeeId }, jwtSecret)
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

export const isoStringToDatetime = (isoString: string) => {
  const [date, time] = isoString.split('T')
  return `${date} ${time.slice(0, -1)}`
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
      hourlyRate = rate.dividedBy(168); // 20 working days * 8.4 hours = 168 hours
      break;
    default:
      throw new Error('Invalid rate type');
  }

  return hourlyRate.toDecimalPlaces(2);
}

export const calculateSalary = (hourlyRate: number | Prisma.Decimal, secondsWork: number ) => {
  let totalHoursWorked = new Prisma.Decimal(secondsWork).dividedBy(3600)
  const roundedHours = totalHoursWorked.toDecimalPlaces(2);
  return new Prisma.Decimal(hourlyRate).times(roundedHours);
}

export const toDecimalPlaces = (num: number, decimals: number) => {
  return new Prisma.Decimal(num).toDecimalPlaces(decimals).toNumber()
}

export const decimal = (num: number) => {
  return new Prisma.Decimal(num)
}