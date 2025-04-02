import { PrismaClient } from "@prisma/client";
import { encrypt } from "src/utils/crypter";

const prisma = new PrismaClient()

async function main() {
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Hotel 1',
      address: 'Ozamiz City, Misamis Occidental',
      roomsCleaningRate: 50,
      roomsRefreshRate: 50
    }
  })

  const employee = await prisma.employee.create({
    data: {
      firstName: 'Ryan',
      middleName: 'Thomas',
      lastName: 'Gosling',
      birthdate: new Date(1980, 10, 12),
      gender: 'male',
      mobileNumber: '',
      civilStatus: 'single',
      email: '',
      address: 'molave zds',
      hiredDate: new Date(),
      status: 'check_out',
      rateType: '',
      rate: 100,
      position: '',
      hotelId: hotel.id
    }
  })

  const user = await prisma.user.create({
    data: {
      username: 'admin',
      password: encrypt('string'),
      role: 'agnos_admin'
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
