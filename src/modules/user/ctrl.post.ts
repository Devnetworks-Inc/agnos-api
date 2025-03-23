import resp from "objectify-response";
import { NextFunction, Response } from "express";
import { decrypt, encrypt } from "src/utils/crypter";
import { Prisma } from "@prisma/client";
import { createJwtToken } from "src/utils/helper";
import prisma from "../prisma";
import { LoginRequest, UserCreateRequest } from "./schema";

export const userLoginController = async (req: LoginRequest, res: Response) => {
  const { username, password } = req.body

  let user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
      password: true,
      role: true,
      currentHotelId: true,
      employeeId: true
    }
  })

  if (!user || decrypt(user.password) !== password) {
    return resp(res, 'Invalid username or password', 401)
  }

  if (user.role !== 'agnos_admin' && !user.employeeId) {
    return resp(res, 'Unauthorized', 401)
  }

  if (user.role !== 'agnos_admin' && !user.currentHotelId && user.employeeId) {
    const hotel = await prisma.hotel.findFirst({
      where: { employees: { some: { id: user.employeeId } } }
    })
    if (!hotel) {
      return resp(res, 'Unauthorized', 401)
    }
    user.currentHotelId = hotel.id
  }

  const { password: p, ...rest } = user

  const token = createJwtToken({
    ...rest,
  })
  resp(res, { token })
};

export const userCreateController = async (req: UserCreateRequest, res: Response, next: NextFunction) => {
  const { password, employeeId, role } = req.body

  if (role !== 'agnos_admin' && !employeeId) {
    return resp(res, 'Employee Id is required', 400)
  }

  const existingUser = await prisma.user.findUnique({
    where: { employeeId }
  });
  
  if (existingUser) {
    return resp(res, 'A user with this employee already exists', 400);
  }  

  prisma.user.create({
    data: {
      ...req.body,
      password: encrypt(password),
    }
  })
  .then((user) => {
    resp(res, user)
  })
  .catch( e => {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        return resp(
          res,
          'Username already exist',
          400
        )
      }
    }
    next(e)
  })
};