-- 1. Enable PostGIS extension (hanya perlu dilakukan sekali)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Buat index untuk mengoptimalkan query spasial pada tabel workshops
-- Index untuk latitude dan longitude
CREATE INDEX IF NOT EXISTS idx_workshop_lat 
ON "workshops" (latitude);

CREATE INDEX IF NOT EXISTS idx_workshop_lon 
ON "workshops" (longitude);

-- 3. Buat function untuk menghitung jarak
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
) 
RETURNS DECIMAL 
AS $$
BEGIN
    RETURN ST_Distance(
        ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
        ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
    ) / 1000;
END;
$$ LANGUAGE plpgsql;

-- 4. Buat view untuk mempermudah query (optional)
CREATE OR REPLACE VIEW workshop_locations AS
SELECT 
    id,
    name,
    latitude,
    longitude,
    ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography AS geom
FROM "workshops";

-- 5. Contoh query yang dioptimasi untuk mencari workshop terdekat
CREATE OR REPLACE FUNCTION find_nearest_workshops(
    user_lat DECIMAL,
    user_lon DECIMAL,
    max_distance DECIMAL DEFAULT NULL,
    limit_count INTEGER DEFAULT 10,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id VARCHAR(30),
    name VARCHAR(100),
    distance DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.name,
        calculate_distance(user_lat, user_lon, w.latitude, w.longitude) as distance
    FROM "workshops" w
    WHERE 
        CASE 
            WHEN max_distance IS NOT NULL THEN
                calculate_distance(user_lat, user_lon, w.latitude, w.longitude) <= max_distance
            ELSE TRUE
        END
    ORDER BY ST_SetSRID(ST_MakePoint(w.longitude, w.latitude), 4326)::geography <-> 
             ST_SetSRID(ST_MakePoint(user_lon, user_lat), 4326)::geography
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;