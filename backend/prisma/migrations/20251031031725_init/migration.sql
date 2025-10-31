-- CreateTable
CREATE TABLE "Perro" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "raza" TEXT NOT NULL,
    "edad" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION NOT NULL,
    "vacunado" BOOLEAN NOT NULL,

    CONSTRAINT "Perro_pkey" PRIMARY KEY ("id")
);
