import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { randomInt } from "node:crypto";
import { db } from "../db/index.js";
import { loginCodes, users } from "../db/schema.js";
import { sendLoginCode } from "../services/email.js";

const TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
const LOGIN_CODE_MAX_AGE = 10 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: TOKEN_MAX_AGE,
};

const publicUser = ({ password, ...user }) => user;

function createToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

function validBirthdate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  return Boolean(value) && !Number.isNaN(date.getTime()) && date < new Date();
}

function validEmail(value) {
  return Boolean(value) && /^\S+@\S+\.\S+$/.test(value);
}

function validPassword(value) {
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /[0-9]/.test(value);
  const hasSymbol = /[^A-Za-z0-9]/.test(value);
  const hasMinLength = value.length >= 8;

  return hasUppercase && hasLowercase && hasNumber && hasSymbol && hasMinLength;
}

export const register = async (req, res) => {
  try {
    const { username, email, password, birthdate, gender = "other", role = "user" } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!username?.trim() || !normalizedEmail || !password || !birthdate) {
      return res.status(400).json({
        message: "username, email, password, and birthdate are required",
      });
    }

    if (username.trim().length < 3 || username.trim().length > 255) {
      return res
        .status(400)
        .json({ message: "Username must be 3-255 characters" });
    }

    if (!validEmail(normalizedEmail)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    if (validPassword(password) === false) {
      return res.status(400).json({ message: "weak password" });
    }

    if (!validBirthdate(birthdate)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid birthdate" });
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const [user] = await db
      .insert(users)
      .values({
        username: username.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        birthdate,
        gender: gender?.trim().toLowerCase() || "other",
        role: role?.trim().toLowerCase() || "user",
      })
      .returning();

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "An account with this email already exists" });
    }

    console.error("Registration failed:", error);
    return res.status(500).json({ message: "Unable to create account" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    return res.status(200).json({ user: publicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);
    return res.status(500).json({ message: "Unable to sign in" });
  }
};

export const requestLoginCode = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!validEmail(normalizedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Keep this response identical for unknown emails, so account emails cannot be guessed.
    if (!user) {
      return res.json({ message: "If an account exists, a sign-in code has been sent." });
    }

    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 12);
    const expiresAt = new Date(Date.now() + LOGIN_CODE_MAX_AGE);

    await db.delete(loginCodes).where(eq(loginCodes.userId, user.id));
    await db.insert(loginCodes).values({ userId: user.id, codeHash, expiresAt });
    await sendLoginCode(user.email, code);

    return res.json({ message: "If an account exists, a sign-in code has been sent." });
  } catch (error) {
    console.error("Sending login code failed:", error);
    return res.status(500).json({ message: "Unable to send sign-in code" });
  }
};

export const loginWithCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedCode = code?.trim();

    if (!validEmail(normalizedEmail) || !/^\d{6}$/.test(normalizedCode || "")) {
      return res.status(400).json({ message: "A valid email and 6-digit code are required" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);
    if (!user) return res.status(401).json({ message: "Invalid or expired sign-in code" });

    const [loginCode] = await db
      .select()
      .from(loginCodes)
      .where(eq(loginCodes.userId, user.id))
      .limit(1);

    const isValid =
      loginCode &&
      loginCode.expiresAt > new Date() &&
      (await bcrypt.compare(code, loginCode.codeHash));
    if (!isValid) return res.status(401).json({ message: "Invalid or expired sign-in code" });

    await db.delete(loginCodes).where(eq(loginCodes.id, loginCode.id));

    const token = createToken(user);
    res.cookie("token", token, cookieOptions);
    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Code login failed:", error);
    return res.status(500).json({ message: "Unable to sign in with code" });
  }
};

export const logout = (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: cookieOptions.secure,
  });
  return res.status(204).send();
};

export const getCurrentUser = async (req, res) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.user.id))
      .limit(1);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({ user: publicUser(user) });
  } catch (error) {
    console.error("Fetching current user failed:", error);
    return res.status(500).json({ message: "Unable to fetch user" });
  }
};
