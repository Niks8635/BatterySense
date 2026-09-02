import aiosqlite
from datetime import datetime, timezone, timedelta
from app.config import settings
from app.models.analytics import TelemetryRecord, AnalyticsResponse
from app.utils.helpers import get_timestamp

class AnalyticsService:
    def __init__(self):
        self.db_path = settings.DATABASE_PATH
        
    async def init_db(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                CREATE TABLE IF NOT EXISTS telemetry (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT,
                    battery_percentage REAL,
                    cpu_usage REAL,
                    ram_usage REAL,
                    disk_usage REAL,
                    power_plugged INTEGER
                )
            ''')
            # Create index on timestamp for fast queries
            await db.execute('''
                CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp)
            ''')
            await db.commit()
            
    async def record_telemetry(self, battery_pct: float | None, cpu_usage: float | None, ram_usage: float | None, disk_usage: float | None, power_plugged: int | None):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('''
                INSERT INTO telemetry (timestamp, battery_percentage, cpu_usage, ram_usage, disk_usage, power_plugged)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (get_timestamp(), battery_pct, cpu_usage, ram_usage, disk_usage, power_plugged))
            await db.commit()
            
    async def get_telemetry(self, period: str) -> AnalyticsResponse:
        minutes = 5
        if period == '15m':
            minutes = 15
        elif period == '30m':
            minutes = 30
        elif period == '1h':
            minutes = 60
        elif period == '24h':
            minutes = 1440
        elif period == '7d':
            minutes = 10080
        elif period == 'all':
            minutes = 525600  # 1 year

        # Use UTC timestamp to match get_timestamp() format
        time_threshold = (datetime.now(timezone.utc) - timedelta(minutes=minutes)).isoformat().replace("+00:00", "Z")
        
        records = []
        async with aiosqlite.connect(self.db_path) as db:
            async with db.execute(
                'SELECT timestamp, battery_percentage, cpu_usage, ram_usage, disk_usage, power_plugged FROM telemetry WHERE timestamp >= ? ORDER BY timestamp ASC',
                (time_threshold,)
            ) as cursor:
                async for row in cursor:
                    records.append(TelemetryRecord(
                        timestamp=row[0],
                        battery_percentage=row[1],
                        cpu_usage=row[2],
                        ram_usage=row[3],
                        disk_usage=row[4],
                        power_plugged=row[5]
                    ))

            # If no records in the strict time window (e.g. system just started up or woke from sleep),
            # fetch the most recent records so the chart is never empty if history exists!
            if len(records) == 0:
                async with db.execute(
                    'SELECT timestamp, battery_percentage, cpu_usage, ram_usage, disk_usage, power_plugged FROM telemetry ORDER BY id DESC LIMIT 50'
                ) as cursor:
                    recent = []
                    async for row in cursor:
                        recent.append(TelemetryRecord(
                            timestamp=row[0],
                            battery_percentage=row[1],
                            cpu_usage=row[2],
                            ram_usage=row[3],
                            disk_usage=row[4],
                            power_plugged=row[5]
                        ))
                    records = list(reversed(recent))
                    
        return AnalyticsResponse(records=records, period=period, count=len(records))
        
    async def cleanup_old_data(self, retention_hours: int):
        time_threshold = (datetime.now(timezone.utc) - timedelta(hours=retention_hours)).isoformat().replace("+00:00", "Z")
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('DELETE FROM telemetry WHERE timestamp < ?', (time_threshold,))
            await db.commit()

    async def clear_all_data(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute('DELETE FROM telemetry')
            await db.commit()

analytics_service = AnalyticsService()
