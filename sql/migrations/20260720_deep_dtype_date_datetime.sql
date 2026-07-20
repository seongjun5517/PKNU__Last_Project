-- Preserve the time of each analysis so feedback can be linked to the latest run.
-- Existing DATE values are retained at 00:00:00; new analyses store full timestamps.
ALTER TABLE deep
    MODIFY COLUMN dtype_date DATETIME(6) NOT NULL;
