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
      // employeeId: true,
      position: true
    }
  })

  if (!user || decrypt(user.password) !== password) {
    return resp(res, 'Invalid username or password', 401)
  }

  if (user.role !== 'agnos_admin' && !user.position) {
    return resp(res, 'Unauthorized. User has no position', 401)
  }

  if (user.role !== 'agnos_admin' && !user.currentHotelId && user.position) {
    const hotel = await prisma.hotel.findFirst({
      where: { employees: { some: { id: user.position.employeeId } } }
    })
    if (!hotel) {
      return resp(res, 'Unauthorized', 401)
    }
    user.currentHotelId = hotel.id
    user.role = user.position.role
  }

  const { password: p, ...rest } = user

  const token = createJwtToken({
    ...rest,
  })
  resp(res, { token })
};

export const userCreateController = async (req: UserCreateRequest, res: Response, next: NextFunction) => {
  const { password, positionId, username } = req.body

  // const existingUser = await prisma.user.findUnique({
  //   where: { employeeId }
  // });
  
  // if (existingUser) {
  //   return resp(res, 'A user with this employee already exists', 400);
  // }  

  const position = await prisma.position.findUnique({
    where: { id: positionId },
    include: { employee: { select: { hotelId: true } } }
  }) 

  if (!position) {
    return resp(res, 'Employee position not found', 404)
  }

  if (position.userId) {
    return resp(res, 'Employee with this position already has a user account', 400);
  }

  prisma.position.update({
    where: { id: positionId },
    data: {
      user: {
        create: {
          username,
          role: position.role,
          currentHotelId: position.employee.hotelId,
          employeeId: position.employeeId,
          password: encrypt(password),
        }
      }
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