import prisma from "../db/prisma.js";

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

function badRequest(message) {
  throw httpError(400, message);
}

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function toInt(v) {
  const n = Number(v);
  return Number.isInteger(n) ? n : null;
}

// POST /api/crops  (FARMER/ADMIN)
export async function createCrop(req, res) {
  const { crop, grade, quantity, images, priceMode } = req.body;

  if (!isNonEmptyString(crop)) badRequest("crop is required");
  if (!isNonEmptyString(grade)) badRequest("grade is required");
  const qty = toInt(quantity);
  if (qty === null || qty <= 0) badRequest("quantity must be a positive integer");

  const safeImages = Array.isArray(images)
    ? images.filter((x) => isNonEmptyString(x)).map((x) => x.trim())
    : [];

  const created = await prisma.crop.create({
    data: {
      farmerId: req.user.id,
      crop: crop.trim(),
      grade,
      quantity: qty,
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
      updatedAt: true,
    },
  });

  res.status(201).json(created);
}

// GET /api/crops (public marketplace list, with optional filters)
export async function getAllCrops(req, res) {
  const { search, grade, priceMode, status, page = "1", limit = "20" } = req.query;

  const take = Math.min(parseInt(limit, 10) || 20, 100);
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const skip = (pageNum - 1) * take;

  const where = {
    ...(isNonEmptyString(search) ? { crop: { contains: String(search), mode: "insensitive" } } : {}),
    ...(isNonEmptyString(grade) ? { grade: String(grade) } : {}),
    ...(isNonEmptyString(priceMode) ? { priceMode: String(priceMode) } : {}),
    ...(isNonEmptyString(status) ? { status: String(status) } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.crop.findMany({
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
    prisma.crop.count({ where }),
  ]);

  res.json({ total, page: pageNum, limit: take, items });
}

// GET /api/crops/mine (dashboard)
export async function getMyCrops(req, res) {
  const items = await prisma.crop.findMany({
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

// PATCH /api/crops/:id (dashboard edit)
export async function updateCrop(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) badRequest("Invalid crop id");

  const existing = await prisma.crop.findUnique({
    where: { id },
    select: { id: true, farmerId: true, status: true },
  });

  if (!existing) throw httpError(404, "Crop listing not found");

  const isAdmin = req.user.role === "ADMIN";
  if (!isAdmin && existing.farmerId !== req.user.id) throw httpError(403, "Forbidden");

  const { crop, grade, quantity, images, priceMode, status } = req.body;

  const data = {};

  if (isNonEmptyString(crop)) data.crop = crop.trim();
  if (isNonEmptyString(grade)) data.grade = grade;

  if (quantity !== undefined) {
    const qty = toInt(quantity);
    if (qty === null || qty <= 0) badRequest("quantity must be a positive integer");
    data.quantity = qty;
  }

  if (priceMode !== undefined) {
    if (!isNonEmptyString(priceMode)) badRequest("priceMode must be a string");
    data.priceMode = priceMode;
  }

  if (status !== undefined) {
    if (!isNonEmptyString(status)) badRequest("status must be a string");
    data.status = status;
  }

  if (images !== undefined) {
    if (!Array.isArray(images)) badRequest("images must be an array of strings");
    data.images = images.filter((x) => isNonEmptyString(x)).map((x) => x.trim());
  }

  const updated = await prisma.crop.update({
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
      createdAt: true,
      updatedAt: true,
    },
  });

  res.json(updated);
}

// DELETE /api/crops/:id (dashboard delete)
export async function deleteCrop(req, res) {
  const id = parseInt(req.params.id, 10);
  if (!Number.isInteger(id)) badRequest("Invalid crop id");

  const existing = await prisma.crop.findUnique({
    where: { id },
    select: { id: true, farmerId: true },
  });

  if (!existing) throw httpError(404, "Crop listing not found");

  const isAdmin = req.user.role === "ADMIN";
  if (!isAdmin && existing.farmerId !== req.user.id) throw httpError(403, "Forbidden");

  await prisma.crop.delete({ where: { id } });
  res.json({ message: "Deleted successfully" });
}
