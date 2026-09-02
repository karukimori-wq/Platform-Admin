# Free / Pro Release Monitoring

Platform Admin monitors release readiness for Numeria Studio and Velvet without owning plan, billing, customer, conversation, or appraisal records.

## Scope

The `/api/plan-readiness` endpoint checks operational readiness only:

- Production reachability
- `/health`
- `/version`
- `/contracts/status`
- plan contract version
- Free / Pro / Business configuration state
- entitlement decision API
- usage aggregation
- billing webhook last successful status timestamp
- plan change reflection
- usage limit decision
- AI Platform Core usage integration
- Feedback Hub entrypoint

## Safety Boundary

Do not expose or persist:

- secret values
- payment details
- customer conversation body
- appraisal body
- report content
- raw webhook payloads

Webhook monitoring stores only status metadata such as the last successful timestamp.

## Release Expectations

- Free plan is configured.
- Pro plan is configured.
- Business exists only as a future plan and is not purchasable.
- Free limit decisions can be evaluated.
- Pro entitlement decisions can be evaluated.
- Plan changes can be reflected without stale access.
- Usage can be aggregated and linked to AI Platform Core.
- Feedback Hub entrypoint is available for questions, bugs, and improvement requests.