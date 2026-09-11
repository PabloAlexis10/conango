import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USERS_FILE = path.join(process.cwd(), "data", "registered_accounts.json");

function ensureFile() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, "[]", "utf-8");
  }
}

function loadUsers() {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function saveUsers(users: any[]) {
  ensureFile();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
}

export async function GET() {
  try {
    const users = loadUsers();
    return NextResponse.json({ success: true, users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, userEmail, isPro, proDays, usersSync } = body;

    let users = loadUsers();

    // Batch sync from client accounts
    if (action === "sync" && Array.isArray(usersSync)) {
      usersSync.forEach((incomingUser) => {
        const idx = users.findIndex(
          (u: any) => u.id === incomingUser.id || (u.email && u.email.toLowerCase() === incomingUser.email.toLowerCase())
        );
        if (idx !== -1) {
          users[idx] = { ...users[idx], ...incomingUser };
        } else {
          users.push(incomingUser);
        }
      });
      saveUsers(users);
      return NextResponse.json({ success: true, users });
    }

    if (!userId && !userEmail) {
      return NextResponse.json({ success: false, error: "Identificador de usuario no provisto." }, { status: 400 });
    }

    const idx = users.findIndex(
      (u: any) => u.id === userId || (u.email && u.email.toLowerCase() === (userEmail || "").toLowerCase())
    );

    if (idx === -1) {
      // Create user record if not yet on server
      const newUser = {
        id: userId || `usr_${Date.now()}`,
        name: body.userName || "Cadete",
        email: userEmail || "cadete@conango.com",
        isPro: Boolean(isPro),
        proExpiresAt: proDays ? new Date(Date.now() + proDays * 86400000).toISOString() : null,
        role: "cadet",
        xp: 100,
        medals: isPro ? 9999 : 15,
        gems: 100,
        created_at: new Date().toISOString(),
      };
      users.push(newUser);
      saveUsers(users);
      return NextResponse.json({ success: true, user: newUser, users });
    }

    // Update existing user
    if (action === "revoke_pro") {
      users[idx].isPro = false;
      users[idx].proExpiresAt = null;
      users[idx].medals = Math.min(users[idx].medals || 15, 15);
    } else if (action === "grant_pro") {
      users[idx].isPro = true;
      users[idx].medals = 9999;
      if (proDays) {
        users[idx].proExpiresAt = new Date(Date.now() + proDays * 86400000).toISOString();
      } else {
        users[idx].proExpiresAt = null; // Vitalicio
      }
    } else if (action === "toggle_pro") {
      users[idx].isPro = !users[idx].isPro;
      if (users[idx].isPro) {
        users[idx].medals = 9999;
      }
    }

    saveUsers(users);
    return NextResponse.json({ success: true, user: users[idx], users });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
