import pg from 'pg';
import config from './src/config.js';

async function migrate() {
  const c = new pg.Client({ connectionString: config.databaseUrl });
  await c.connect();
  try {
    console.log('Creating ride_pickup_nodes table...');
    await c.query(`
      CREATE TABLE IF NOT EXISTS ride_pickup_nodes (
        node_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        organization_id UUID NOT NULL REFERENCES organizations(organization_id) ON DELETE CASCADE,
        ride_id         UUID NOT NULL,
        node_index      SMALLINT NOT NULL,
        lat             DECIMAL(9,6) NOT NULL,
        lng             DECIMAL(9,6) NOT NULL,
        address         TEXT,
        FOREIGN KEY (organization_id, ride_id) REFERENCES rides(organization_id, ride_id) ON DELETE CASCADE
      );
      CREATE INDEX IF NOT EXISTS idx_pickup_nodes_ride ON ride_pickup_nodes(organization_id, ride_id);
    `);

    console.log('Adding pickup_node_id to ride_bookings...');
    await c.query(`
      ALTER TABLE ride_bookings
        ADD COLUMN IF NOT EXISTS pickup_node_id UUID REFERENCES ride_pickup_nodes(node_id);
      ALTER TABLE ride_bookings
        ADD COLUMN IF NOT EXISTS passenger_pickup_lat DECIMAL(9,6),
        ADD COLUMN IF NOT EXISTS passenger_pickup_lng DECIMAL(9,6);
    `);

    console.log('Migration successful.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    await c.end();
  }
}
migrate().catch((e) => { console.error(e.message); process.exit(1); });
