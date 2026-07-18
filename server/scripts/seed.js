// Seeds a demo organization with an admin, employees, vehicles, wallets and
// a sample open ride. Safe to run once on a fresh DB. Usage: npm run seed
import pg from 'pg';
import bcrypt from 'bcryptjs';
import config from '../src/config.js';

const DEMO = {
  orgCode: 'ACME',
  orgName: 'Acme Corp',
  domain: 'acme.com',
  adminEmail: 'admin@acme.com',
  adminPass: 'admin123',
  employees: [
    { email: 'ravi@acme.com',  name: 'Ravi Kumar',   pass: 'password123', dept: 'Engineering', desig: 'SDE II' },
    { email: 'priya@acme.com', name: 'Priya Sharma',  pass: 'password123', dept: 'Design',      desig: 'Product Designer' },
    { email: 'arjun@acme.com', name: 'Arjun Mehta',   pass: 'password123', dept: 'Sales',       desig: 'AE' },
  ],
};

async function main() {
  if (!config.databaseUrl) throw new Error('DATABASE_URL not set');
  const connectionString = config.databaseUrl.replace(/\?sslmode=require$/, '');
  const c = new pg.Client({
    connectionString,
    ssl: config.databaseUrl.includes('localhost') ? false : { rejectUnauthorized: false },
  });
  await c.connect();
  await c.query('BEGIN');
  try {
    const org = (await c.query(
      `INSERT INTO organizations (org_name, org_code, domain_email)
       VALUES ($1,$2,$3)
       ON CONFLICT (org_code) DO UPDATE SET org_name=EXCLUDED.org_name
       RETURNING *`,
      [DEMO.orgName, DEMO.orgCode, DEMO.domain])).rows[0];
    const orgId = org.organization_id;

    await c.query(
      `INSERT INTO organization_settings (organization_id, fuel_cost_per_litre, avg_fuel_efficiency_kmpl, cost_per_km)
       VALUES ($1, 105.00, 16.00, 6.60) ON CONFLICT (organization_id) DO NOTHING`,
      [orgId]);

    // Admin (user + organization_admins)
    const adminHash = await bcrypt.hash(DEMO.adminPass, 10);
    const adminUser = (await c.query(
      `INSERT INTO users (email, password_hash, full_name) VALUES ($1,$2,'Acme Admin')
       ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING *`,
      [DEMO.adminEmail, adminHash])).rows[0];
    await c.query(
      `INSERT INTO organization_admins (organization_id, user_id, is_super_admin)
       VALUES ($1,$2,TRUE) ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [orgId, adminUser.user_id]);

    // Employees + wallets
    const empIds = [];
    for (const e of DEMO.employees) {
      const hash = await bcrypt.hash(e.pass, 10);
      const user = (await c.query(
        `INSERT INTO users (email, password_hash, full_name) VALUES ($1,$2,$3)
         ON CONFLICT (email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING *`,
        [e.email, hash, e.name])).rows[0];
      const emp = (await c.query(
        `INSERT INTO employees (organization_id, user_id, department, designation)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (organization_id, user_id) DO UPDATE SET department=EXCLUDED.department
         RETURNING *`,
        [orgId, user.user_id, e.dept, e.desig])).rows[0];
      await c.query(`INSERT INTO wallets (organization_id, employee_id, balance) VALUES ($1,$2,500)
                     ON CONFLICT (organization_id, employee_id) DO NOTHING`, [orgId, emp.employee_id]);
      empIds.push(emp.employee_id);
    }

    // Driver vehicle for the first employee
    const vehicle = (await c.query(
      `INSERT INTO vehicles (organization_id, employee_id, vehicle_model, registration_number, seating_capacity, fuel_type, is_verified)
       VALUES ($1,$2,'Maruti Swift','KA01AB1234',4,'PETROL',TRUE)
       ON CONFLICT (organization_id, registration_number) DO UPDATE SET vehicle_model=EXCLUDED.vehicle_model
       RETURNING *`,
      [orgId, empIds[0]])).rows[0];

    // A sample OPEN ride (Bengaluru: Koramangala -> Whitefield) tomorrow 9am
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(9, 0, 0, 0);
    const ride = (await c.query(
      `INSERT INTO rides (organization_id, driver_employee_id, vehicle_id,
         pickup_address, pickup_lat, pickup_lng,
         destination_address, destination_lat, destination_lng,
         distance_km, duration_minutes, departure_datetime, total_seats, available_seats, fare_per_seat, status)
       VALUES ($1,$2,$3,'Koramangala, Bengaluru',12.935200,77.624600,
         'Whitefield, Bengaluru',12.969800,77.749900, 18.50, 55, $4, 3, 3, 80.00, 'OPEN')
       RETURNING *`,
      [orgId, empIds[0], vehicle.vehicle_id, tomorrow.toISOString()])).rows[0];

    // Create a completed trip for payment testing: passenger has a booking and trip is done, payment still pending.
    const passengerEmployeeId = empIds[1];
    const booking = (await c.query(
      `INSERT INTO ride_bookings (organization_id, ride_id, passenger_employee_id, seats_booked, fare_amount, booking_status)
       VALUES ($1,$2,$3,1,80.00,'COMPLETED')
       RETURNING *`,
      [orgId, ride.ride_id, passengerEmployeeId])).rows[0];

    const trip = (await c.query(
      `INSERT INTO trips (organization_id, ride_id, booking_id, driver_employee_id, passenger_employee_id, status, started_at, completed_at, actual_distance_km, actual_duration_minutes)
       VALUES ($1,$2,$3,$4,$5,'COMPLETED', now() - interval '60 minutes', now(), 18.50, 55)
       RETURNING *`,
      [orgId, ride.ride_id, booking.booking_id, empIds[0], passengerEmployeeId])).rows[0];

    await c.query(
      `INSERT INTO trip_status_history (organization_id, trip_id, status, changed_by_employee_id)
       VALUES ($1,$2,'COMPLETED',$3)`,
      [orgId, trip.trip_id, empIds[0]]);

    await c.query(
      `INSERT INTO payments (organization_id, trip_id, payer_employee_id, payee_employee_id, amount, payment_method, status)
       VALUES ($1,$2,$3,$4,80.00,'CASH','PENDING')
       ON CONFLICT (organization_id, payment_id) DO NOTHING`,
      [orgId, trip.trip_id, passengerEmployeeId, empIds[0]]);

    await c.query(
      `INSERT INTO ride_history (organization_id, trip_id, driver_employee_id, passenger_employee_id, vehicle_id, pickup_address, destination_address, trip_date, distance_km, fare_amount, fuel_cost, final_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,CURRENT_DATE,18.50,80.00,0.00,'COMPLETED')`,
      [orgId, trip.trip_id, empIds[0], passengerEmployeeId, vehicle.vehicle_id, 'Koramangala, Bengaluru', 'Whitefield, Bengaluru']);

    await c.query('COMMIT');
    console.log('✅ Seeded demo org "Acme Corp".');
    console.log('   Org code : ACME');
    console.log('   Admin    : admin@acme.com / admin123');
    console.log('   Employees: ravi@acme.com, priya@acme.com, arjun@acme.com  (pw: password123)');
    console.log('   Razorpay test trip: completed trip created for Priya to pay Ravi (₹80.00 pending).');
  } catch (e) {
    await c.query('ROLLBACK');
    throw e;
  } finally {
    await c.end();
  }
}

main().catch((e) => { console.error('❌ Seed failed:', e.message); process.exit(1); });
