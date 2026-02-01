import prisma from "../db/prisma.js";

function badRequest(message) {
  const err = new Error(message);
  err.statusCode = 400;
  throw err;
}

export async function createCropListing(req, res) {
  const { crop, grade, quantity, images, priceMode } = req.body;

  if (!crop || typeof crop !== "string") badRequest("crop is required");
  if (!grade) badRequest("grade is required");
  if (!Number.isInteger(quantity) || quantity <= 0) badRequest("quantity must be a positive integer");

  // images optional but must be array of strings if present
  const safeImages = Array.isArray(images)
    ? images.filter((x) => typeof x === "string" && x.trim().length > 0)
    : [];

  const listing = await prisma.cropListing.create({
    data: {
      farmerId: req.user.id,
      crop: crop.trim(),
      grade,
      quantity,
      images: safeImages,
      priceMode: priceMode ?? "FIXED",
    },
    select: {
      id: true,
      farmerId: true,
      crop: true,
      grade: true,
      quantity: true,
      images: true,
      priceMode: true,
      status: true,
      createdAt: true,
    },
  });

  res.status(201).json(listing);
}

export async function getAllCropListings(req, res) {
  const { search, grade, priceMode, status, page = "1", limit = "20" } = req.query;

  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const skip = (Math.max(parseInt(page, 10) || 1, 1) - 1) * take;

  const where = {
    ...(search ? { crop: { contains: String(search), mode: "insensitive" } } : {}),
    ...(grade ? { grade: String(grade) } : {}),
    ...(priceMode ? { priceMode: String(priceMode) } : {}),
    ...(status ? { status: String(status) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.cropListing.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        farmerId: true,
        crop: true,
        grade: true,
        quantity: true,
        images: true,
        priceMode: true,
        status: true,
        createdAt: true,
        farmer: { select: { name: true } },
      },
    }),
    prisma.cropListing.count({ where }),
  ]);

  res.json({ total, page: parseInt(page, 10) || 1, limit: take, items });
}

export async function getMyCropListings(req, res) {
  const items = await prisma.cropListing.findMany({
    where: { farmerId: req.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      farmerId: true,
      crop: true,
      grade: true,
      quantity: true,
      images: true,
      priceMode: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(items);
}

export async function updateCropListing(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) badRequest("Invalid crop listing id");

  const existing = await prisma.cropListing.findUnique({
    where: { id },
    select: { id: true, farmerId: true, status: true },
  });

  if (!existing) {
    const err = new Error("Crop listing not found");
    err.statusCode = 404;
    throw err;
  }

  // Owner-only unless admin
  const isAdmin = req.user.role === "ADMIN";
  if (!isAdmin && existing.farmerId !== req.user.id) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  const { crop, grade, quantity, images, priceMode, status } = req.body;

  // Optional: lock edits when SOLD (your call)
  // if (existing.status === "SOLD") badRequest("Cannot edit a SOLD listing");

  const data = {};
  if (typeof crop === "string" && crop.trim()) data.crop = crop.trim();
  if (grade) data.grade = grade;
  if (Number.isInteger(quantity) && quantity > 0) data.quantity = quantity;
  if (priceMode) data.priceMode = priceMode;
  if (status) data.status = status;

  if (Array.isArray(images)) {
    data.images = images.filter((x) => typeof x === "string" && x.trim().length > 0);
  }

  const updated = await prisma.cropListing.update({
    where: { id },
    data,
    select: {
      id: true,
      farmerId: true,
      crop: true,
      grade: true,
      quantity: true,
      images: true,
      priceMode: true,
      status: true,
      updatedAt: true,
    },
  });

  res.json(updated);
}

export async function deleteCropListing(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) badRequest("Invalid crop listing id");

  const existing = await prisma.cropListing.findUnique({
    where: { id },
    select: { id: true, farmerId: true },
  });

  if (!existing) {
    const err = new Error("Crop listing not found");
    err.statusCode = 404;
    throw err;
  }

  const isAdmin = req.user.role === "ADMIN";
  if (!isAdmin && existing.farmerId !== req.user.id) {
    const err = new Error("Forbidden");
    err.statusCode = 403;
    throw err;
  }

  await prisma.cropListing.delete({ where: { id } });
  res.json({ message: "Deleted successfully" });
}
