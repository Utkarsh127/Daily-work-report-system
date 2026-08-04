/**
 * Seed Script — Daily Work Report System
 *
 * Creates:
 *   - 3 Departments (Engineering, Design, Marketing)
 *   - 1 Manager (manager@wrs.local / Manager@123)
 *   - 3 Employees with auto-generated IDs
 *   - Sample reports for the past 7 days per employee
 *
 * Usage:
 *   npm run seed
 *
 * Safe to re-run — uses upsert/findOrCreate patterns.
 * WARNING: Clears existing reports before seeding.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('../config/db');

const Department = require('../models/Department.model');
const User       = require('../models/User.model');

// ── Seed data ─────────────────────────────────────────────

const departments = [
  { name: 'Engineering', code: 'ENG', description: 'Software development and infrastructure' },
  { name: 'Design',      code: 'DES', description: 'UI/UX and product design' },
  { name: 'Marketing',   code: 'MKT', description: 'Marketing and growth' },
];

const MANAGER = {
  name:  'Sarah Mitchell',
  email: 'manager@wrs.local',
  password: 'Manager@123',
  role: 'manager',
};

const EMPLOYEES = [
  { name: 'Alice Johnson',  email: 'alice@wrs.local',  password: 'Employee@123', deptCode: 'ENG' },
  { name: 'Bob Carter',     email: 'bob@wrs.local',    password: 'Employee@123', deptCode: 'DES' },
  { name: 'Carol Williams', email: 'carol@wrs.local',  password: 'Employee@123', deptCode: 'MKT' },
];

const TASK_POOL = [
  { title: 'Sprint planning',       description: 'Participated in sprint planning meeting',         hoursSpent: 1.5, status: 'completed' },
  { title: 'Code review',           description: 'Reviewed PRs for the authentication module',      hoursSpent: 2,   status: 'completed' },
  { title: 'Feature development',   description: 'Implemented dashboard analytics components',      hoursSpent: 4,   status: 'in-progress' },
  { title: 'Bug fix — login flow',  description: 'Fixed JWT expiry edge case on mobile',            hoursSpent: 1.5, status: 'completed' },
  { title: 'Documentation',         description: 'Updated API documentation for reports endpoints', hoursSpent: 1,   status: 'completed' },
  { title: 'Design review',         description: 'Reviewed new UI mockups with the team',           hoursSpent: 1,   status: 'completed' },
  { title: 'Database optimisation', description: 'Added compound index for reports queries',        hoursSpent: 2,   status: 'completed' },
  { title: 'Testing',               description: 'Wrote unit tests for report service',             hoursSpent: 2.5, status: 'completed' },
  { title: 'Deployment',            description: 'Deployed v1.2 to staging environment',           hoursSpent: 1,   status: 'completed' },
  { title: 'Client call',           description: 'Sync call with stakeholders on project status',  hoursSpent: 1,   status: 'blocked' },
];

const MOODS = ['great', 'good', 'good', 'neutral', 'good', 'great', 'neutral'];

// ── Helpers ───────────────────────────────────────────────

const hashPassword = async (plain) => bcrypt.hash(plain, 12);

const pickRandom = (arr, count) => {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

// ── Main ──────────────────────────────────────────────────

const seed = async () => {
  console.log('\n🌱 Starting seed…\n');

  await connectDB();

  // 1. Departments
  console.log('📁 Creating departments…');
  const deptMap = {};
  for (const d of departments) {
    const dept = await Department.findOneAndUpdate(
      { code: d.code },
      { $set: d },
      { upsert: true, new: true }
    );
    deptMap[d.code] = dept._id;
    console.log(`   ✔ ${d.name} (${d.code})`);
  }

  // 2. Manager
  console.log('\n👔 Creating manager…');
  const hashedManagerPw = await hashPassword(MANAGER.password);
  const manager = await User.findOneAndUpdate(
    { email: MANAGER.email },
    {
      $set: {
        name:     MANAGER.name,
        email:    MANAGER.email,
        password: hashedManagerPw,
        role:     'manager',
        isActive: true,
      },
    },
    { upsert: true, new: true }
  );
  console.log(`   ✔ ${manager.name} <${manager.email}> [manager]`);
  console.log(`   🔑 Password: ${MANAGER.password}`);

  // Update dept manager reference
  await Department.findOneAndUpdate({ code: 'ENG' }, { manager: manager._id });

  // 3. Employees
  console.log('\n👥 Creating employees…');
  const createdEmployees = [];

  for (const emp of EMPLOYEES) {
    let user = await User.findOne({ email: emp.email });

    if (!user) {
      const employeeId = await User.generateEmployeeId();
      user = await User.create({
        name:       emp.name,
        email:      emp.email,
        password:   emp.password,
        role:       'employee',
        department: deptMap[emp.deptCode],
        employeeId,
        isActive:   true,
      });
    } else {
      // Update password in case it changed
      user.password = emp.password;
      user.department = deptMap[emp.deptCode];
      await user.save();
    }

    createdEmployees.push(user);
    console.log(`   ✔ ${user.name} <${user.email}> [${user.employeeId}]`);
    console.log(`   🔑 Password: ${emp.password}`);
  }

  // 4. Reports — require Report model (will be seeded in M3)
  // Check if Report model exists; if so, seed reports
  let Report;
  try {
    Report = require('../models/Report.model');
  } catch (e) {
    console.log('\n⚠️  Report model not found — skipping report seed (will run in M3).');
    Report = null;
  }

  if (Report) {
    console.log('\n📋 Seeding sample reports (last 7 days)…');

    for (const employee of createdEmployees) {
      for (let daysBack = 6; daysBack >= 0; daysBack--) {
        const reportDate = daysAgo(daysBack);

        // Skip weekends
        const dow = reportDate.getDay();
        if (dow === 0 || dow === 6) continue;

        const tasks = pickRandom(TASK_POOL, Math.floor(Math.random() * 3) + 2);
        const totalHours = tasks.reduce((sum, t) => sum + t.hoursSpent, 0);
        const mood = MOODS[daysBack % MOODS.length];

        await Report.findOneAndUpdate(
          { employee: employee._id, date: reportDate },
          {
            $set: {
              employee:   employee._id,
              date:       reportDate,
              tasks,
              totalHours,
              mood,
              blockers:   mood === 'bad' ? 'Waiting on external dependency' : '',
              notes:      `Day ${7 - daysBack} of sprint — steady progress`,
              submittedAt: reportDate,
            },
          },
          { upsert: true, new: true }
        );
      }
      console.log(`   ✔ Reports seeded for ${employee.name}`);
    }
  }

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║            Seed completed! ✅                ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Manager:   manager@wrs.local                ║');
  console.log('║  Password:  Manager@123                      ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Employee:  alice@wrs.local                  ║');
  console.log('║  Employee:  bob@wrs.local                    ║');
  console.log('║  Employee:  carol@wrs.local                  ║');
  console.log('║  Password:  Employee@123 (all employees)     ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
