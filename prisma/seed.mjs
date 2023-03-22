import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  await prisma.user.upsert({
    where: { username: "koombea" },
    update: {},
    create: {
      username: "koombea",
      password: "$2b$10$/7GWb5qKSp7SO6uBSXaHw.NNZWpzft1EL0WWLLzhUXCNqLuULEK2W", //123456
    },
  })
}

try {
  await main()
  await prisma.$disconnect()
} catch (error) {
  console.error(e)
  await prisma.$disconnect()
  process.exit(1)
}
