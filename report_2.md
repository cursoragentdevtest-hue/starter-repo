# Report 2: Helios Telemetry Ingestion Pipeline

## Executive Summary

Helios is a high-throughput telemetry ingestion pipeline built to collect, validate, and store sensor readings from industrial IoT devices deployed in manufacturing plants. The design prioritizes durability of incoming measurements, predictable latency for operational dashboards, and cost-efficient long-term retention of time-series data. This report describes the end-to-end flow from device firmware to analyst-facing query interfaces.

## System Context

Field devices connect over MQTT to regional broker clusters. Each device belongs to a tenant organization and publishes readings at intervals ranging from one second to one minute depending on sensor type. Downstream consumers include real-time alerting engines, batch analytics jobs, and a Grafana-compatible visualization layer. Legacy SCADA systems receive selected aggregates through a dedicated export adapter.

## Core Components

MQTT brokers accept device connections and enforce topic-level access control lists. A stream processor normalizes payloads, attaches metadata such as site identifier and firmware version, and routes records to appropriate sinks. A schema registry defines Avro schemas for each device family and rejects malformed messages at the boundary. A time-series database stores recent high-resolution data while colder tiers land in object storage as columnar files.

## Data Architecture

Hot storage retains thirty days of raw samples at full resolution. Hourly rollups are computed continuously and stored alongside raw data for fast range queries. Tenant isolation is enforced at the storage layer using separate logical databases per organization. Metadata about devices, calibration schedules, and maintenance windows lives in a document store queried by the administration portal.

## Ingestion Lifecycle

Devices authenticate using per-device certificates issued during provisioning. Upon connect, the broker validates the certificate chain and maps the client to a tenant context. Each published message is validated against the registered schema, enriched with ingestion timestamps, and written to a durable log before acknowledgment. The stream processor consumes the log in parallel consumer groups partitioned by device identifier hash.

## Scalability Strategy

Broker clusters scale vertically within a region and horizontally by sharding tenants across clusters when connection counts grow. The stream processor auto-scales based on consumer lag metrics. Time-series database nodes are expanded by adding storage-oriented instances with attached high-IOPS volumes. Batch compaction jobs run during off-peak hours to merge small object storage files into larger analytics-friendly partitions.

## Reliability and Failure Modes

Messages are persisted to replicated logs before brokers acknowledge publishers, preventing silent data loss during broker restarts. At-least-once delivery semantics require downstream deduplication using device sequence numbers. If the time-series database is unavailable, the processor spools to local disk with bounded retention until connectivity restores. Disaster recovery relies on cross-region replication of the durable log and nightly backups of metadata stores.

## Security Posture

Device certificates are rotated annually through an over-the-air update mechanism. Administrative APIs require multi-factor authentication and role-based access control aligned to tenant boundaries. Encryption in transit uses TLS 1.3 for all external connections. Encryption at rest applies to both time-series volumes and object storage buckets using customer-managed keys where required by contract.

## Observability

Pipeline health is monitored through lag dashboards, broker connection counts, and schema rejection rates. Synthetic devices publish canary messages to detect end-to-end breakage. Tracing spans cover broker handoff, stream processing stages, and database write paths. Capacity reviews occur monthly using growth projections derived from active device counts.

## Deployment Model

Infrastructure is defined as code and deployed across three availability zones per region. Brokers and processors run on dedicated node pools to avoid noisy-neighbor effects from unrelated workloads. Configuration changes propagate through a staged rollout: development, staging, and production with automated smoke tests between stages. Object storage lifecycle policies transition data to infrequent access tiers after ninety days.

## Performance Requirements

End-to-end ingestion latency from device publish to queryable storage must remain below five seconds for ninety percent of messages under nominal plant load. Dashboard refresh intervals support one-second granularity for critical temperature and pressure sensors. Batch export jobs to the enterprise data lake complete within four hours of the scheduled window start. Parser throughput benchmarks require headroom of at least forty percent above peak measured ingress rates.

## Integration Points

Manufacturing execution systems receive hourly aggregate feeds through a REST pull interface authenticated via OAuth client credentials. Maintenance management software subscribes to calibration-due events through a dedicated notification topic. Third-party analytics vendors access anonymized datasets through governed share agreements. Legacy Modbus gateways connect through protocol adapters that translate readings into canonical MQTT topics.

## Future Roadmap

Upcoming work prioritizes adaptive sampling for low-priority sensors, unified anomaly detection across tenant fleets, and self-service device provisioning portals. Edge preprocessing modules that filter noise before cloud ingress remain in prototype stage pending hardware partner certification timelines.

## Open Questions

The platform team is evaluating whether to adopt a unified query engine over both hot and cold tiers or maintain separate interfaces. Compression algorithm selection for cold storage remains unresolved pending benchmark results on representative workloads. Integration with a forthcoming enterprise data lake may require additional export formats beyond current Parquet defaults.
