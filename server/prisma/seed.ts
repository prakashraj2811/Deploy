import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS: { key: string; module: string; description: string }[] = [
  { key: "users.view", module: "users", description: "View users" },
  { key: "users.create", module: "users", description: "Create users" },
  { key: "users.edit", module: "users", description: "Edit users / change status" },
  { key: "users.delete", module: "users", description: "Delete or restore users" },
  { key: "users.verify", module: "users", description: "Verify user identity" },

  { key: "profiles.view", module: "profiles", description: "View any profile" },
  { key: "profiles.edit", module: "profiles", description: "Edit any profile" },
  { key: "profiles.approve", module: "profiles", description: "Approve/reject profile verification" },

  { key: "payments.view", module: "payments", description: "View payments" },
  { key: "payments.refund", module: "payments", description: "Issue refunds" },

  { key: "subscriptions.view", module: "subscriptions", description: "View subscription plans" },
  { key: "subscriptions.create", module: "subscriptions", description: "Create subscription plans" },
  { key: "subscriptions.edit", module: "subscriptions", description: "Edit/deactivate subscription plans" },

  { key: "reports.view", module: "reports", description: "View moderation reports" },
  { key: "reports.manage", module: "reports", description: "Investigate/resolve reports" },

  { key: "support.view", module: "support", description: "View support tickets" },
  { key: "support.manage", module: "support", description: "Manage/assign support tickets" },

  { key: "settings.view", module: "settings", description: "View system settings" },
  { key: "settings.edit", module: "settings", description: "Edit system settings" },

  { key: "admin.dashboard.view", module: "admin", description: "View admin dashboard metrics" },
  { key: "roles.manage", module: "roles", description: "Manage roles and permissions (Super Admin)" },
];

const ROLE_PERMISSIONS: Record<string, string[] | "*"> = {
  super_admin: "*",
  admin: [
    "users.view", "users.create", "users.edit", "users.delete", "users.verify",
    "profiles.view", "profiles.edit", "profiles.approve",
    "payments.view", "payments.refund",
    "subscriptions.view", "subscriptions.create", "subscriptions.edit",
    "reports.view", "reports.manage",
    "support.view", "support.manage",
    "settings.view",
    "admin.dashboard.view",
  ],
  support: ["users.view", "profiles.view", "reports.view", "reports.manage", "support.view", "support.manage"],
  user: [],
};

async function main() {
  console.log("Seeding permissions...");
  const permissionRecords = await Promise.all(
    PERMISSIONS.map((p) =>
      prisma.permission.upsert({ where: { key: p.key }, update: {}, create: p })
    )
  );

  console.log("Seeding roles...");
  const roleDefs = [
    { name: "super_admin", label: "Super Admin", description: "Full system access", isSystem: true },
    { name: "admin", label: "Admin", description: "Manage users, profiles, payments, support", isSystem: true },
    { name: "support", label: "Customer Support", description: "Manage tickets, reports, complaints", isSystem: true },
    { name: "user", label: "User", description: "Standard matrimony member", isSystem: true },
  ];

  const roles: Record<string, { id: string }> = {};
  for (const def of roleDefs) {
    const role = await prisma.role.upsert({ where: { name: def.name }, update: {}, create: def });
    roles[def.name] = role;

    const grantKeys = ROLE_PERMISSIONS[def.name];
    const grantedPermissions = grantKeys === "*" ? permissionRecords : permissionRecords.filter((p) => grantKeys.includes(p.key));

    for (const permission of grantedPermissions) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  console.log("Seeding religions/communities/castes...");
  const religionDefs: Record<string, Record<string, string[]>> = {
    Hindu: { Brahmin: ["Iyer", "Iyengar"], Kshatriya: ["Rajput"], Vaishya: ["Agarwal"] },
    Muslim: { Sunni: ["Sheikh", "Syed"], Shia: ["Syed"] },
    Christian: { Catholic: ["Roman Catholic"], Protestant: ["Baptist"] },
    Sikh: { Jat: ["Jat Sikh"], Khatri: ["Khatri Sikh"] },
  };

  for (const [religionName, communities] of Object.entries(religionDefs)) {
    const religion = await prisma.religion.upsert({ where: { name: religionName }, update: {}, create: { name: religionName } });
    for (const [communityName, castes] of Object.entries(communities)) {
      const community = await prisma.community.upsert({
        where: { religionId_name: { religionId: religion.id, name: communityName } },
        update: {},
        create: { religionId: religion.id, name: communityName },
      });
      for (const casteName of castes) {
        await prisma.caste.upsert({
          where: { communityId_name: { communityId: community.id, name: casteName } },
          update: {},
          create: { communityId: community.id, name: casteName },
        });
      }
    }
  }

  console.log("Seeding locations...");
  const locationDefs = [
    { country: "India", state: "Maharashtra", city: "Mumbai" },
    { country: "India", state: "Karnataka", city: "Bengaluru" },
    { country: "India", state: "Delhi", city: "New Delhi" },
    { country: "India", state: "Tamil Nadu", city: "Chennai" },
    { country: "India", state: "Telangana", city: "Hyderabad" },
  ];
  const locations = [];
  for (const loc of locationDefs) {
    locations.push(
      await prisma.location.upsert({ where: { country_state_city: loc }, update: {}, create: loc })
    );
  }

  console.log("Seeding subscription plans...");
  const plans = [
    { name: "Free", slug: "free", tagline: "Get started", priceCents: 0, durationDays: 36500, features: ["Profile creation", "Limited search", "5 interests/month"], maxInterests: 5, sortOrder: 1 },
    { name: "Basic", slug: "basic", tagline: "For active seekers", priceCents: 99900, durationDays: 90, features: ["More profile views", "50 interests", "Messaging"], maxInterests: 50, sortOrder: 2 },
    { name: "Premium", slug: "premium", tagline: "Most popular", priceCents: 249900, durationDays: 180, features: ["Unlimited interests", "Advanced search", "Contact access", "Priority visibility"], sortOrder: 3 },
    { name: "VIP", slug: "vip", tagline: "White-glove matchmaking", priceCents: 499900, durationDays: 365, features: ["All Premium features", "Relationship manager", "Priority support", "Featured profile"], sortOrder: 4 },
  ];
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({ where: { slug: plan.slug }, update: {}, create: plan });
  }

  console.log("Seeding demo accounts...");
  const passwordHash = await bcrypt.hash("Password@123", 12);

  async function upsertUser(email: string, mobile: string, roleName: string) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        mobile,
        passwordHash,
        emailVerifiedAt: new Date(),
        mobileVerifiedAt: new Date(),
        roles: { create: { roleId: roles[roleName].id } },
        notificationPrefs: { create: {} },
      },
    });
    return user;
  }

  await upsertUser("superadmin@matrimony.test", "+910000000001", "super_admin");
  await upsertUser("admin@matrimony.test", "+910000000002", "admin");
  await upsertUser("support@matrimony.test", "+910000000003", "support");

  const demoProfiles = [
    { email: "arjun.demo@matrimony.test", mobile: "+910000000010", fullName: "Arjun Mehta", gender: "MALE" as const },
    { email: "priya.demo@matrimony.test", mobile: "+910000000011", fullName: "Priya Nair", gender: "FEMALE" as const },
    { email: "rahul.demo@matrimony.test", mobile: "+910000000012", fullName: "Rahul Verma", gender: "MALE" as const },
    { email: "sneha.demo@matrimony.test", mobile: "+910000000013", fullName: "Sneha Iyer", gender: "FEMALE" as const },
  ];

  for (const [i, demo] of demoProfiles.entries()) {
    const user = await upsertUser(demo.email, demo.mobile, "user");
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        fullName: demo.fullName,
        gender: demo.gender,
        dateOfBirth: new Date(1994 + i, i, 10 + i),
        maritalStatus: "NEVER_MARRIED",
        heightCm: 165 + i * 2,
        motherTongue: "Hindi",
        locationId: locations[i % locations.length].id,
        occupation: "Software Engineer",
        highestQualification: "B.Tech",
        foodPreference: "VEGETARIAN",
        status: "VERIFIED",
        completionPercent: 80,
        privacy: { create: {} },
      },
    });
  }

  console.log("Seed complete.");
  console.log("Demo credentials (password: Password@123):");
  console.log("  superadmin@matrimony.test / admin@matrimony.test / support@matrimony.test");
  console.log("  arjun.demo@matrimony.test / priya.demo@matrimony.test / rahul.demo@matrimony.test / sneha.demo@matrimony.test");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
