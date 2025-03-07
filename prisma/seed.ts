import { PrismaClient } from "@prisma/client";
import { encrypt } from "src/utils/crypter";

const prisma = new PrismaClient()

async function main() {
  const employee = await prisma.employee.create({
    data: {
      firstName: 'Ryan',
      middleName: 'Thomas',
      lastName: 'Gosling',
      birthdate: new Date(1980, 10, 12),
      gender: 'male',
      contactNumber: '',
      email: '',
      address: 'molave zds',
      hiredDate: new Date(),
      rateType: '',
      rate: 100,
    }
  })

  const user = await prisma.user.create({
    data: {
      employeeId: employee.id,
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
