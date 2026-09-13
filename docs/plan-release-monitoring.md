# Free / Pro Release Monitoring

Platform Admin monitors Free / Pro release readiness for Numeria Studio, Velvet, AI Platform Core, Feedback Hub, and Growth Engine.

Platform Admin stores and displays only operational metadata. It does not own plan, billing, customer, conversation, message, report, appraisal, AI usage, or Growth Engine business records.

## Scope

The `/api/plan-readiness` endpoint checks release readiness against `professional-platform-contracts/docs/contracts/plan-contract.md`:

- Production reachability
- `/health`
- `/version`
- `/contracts/status`
- `/release/status`
- `/auth/status`
- `/persistence/status`
- `appId`
- `appVersion`
- `planContractVersion`
- `releaseScope`
- Free / Pro / Business configuration state
- Business unavailable, preparing, or not purchasable
- entitlement decision readiness
- usage aggregation readiness
- authentication readiness
- persistence readiness
- D1 / DB readiness
- plan change reflection
- Free limit and Pro permission decision
- AI Platform Core usage integration
- Feedback Hub entrypoint
- latest deploy state
- primary error categories

Existing `/api/*/status` endpoint variants are accepted during migration so current production apps can be monitored while they adopt the canonical endpoints.

## Safety Boundary

Do not expose or persist:

- payment details
- Stripe Secret
- API keys
- customer conversation body
- appraisal body
- message body
- report body
- raw webhook payloads
- secret prompts

The monitoring payload is normalized to `success`, `warning`, `error`, or `skipped` plus short operational details.

## Release Expectations

- Free plan is configured.
- Pro plan is configured.
- Business exists only as a future plan and is not purchasable.
- Free limit decisions can be evaluated.
- Pro entitlement decisions can be evaluated.
- Plan changes can be reflected without stale access.
- Usage can be aggregated and linked to AI Platform Core.
- Auth and persistence readiness are visible.
- Feedback Hub entrypoint is available for questions, bugs, and improvement requests.

## App Response Normalization

Apps may expose release readiness in either flat fields or nested objects. Platform Admin accepts operational status fields such as:

- `planContractVersion`, `planContract.version`, or `plans.contractVersion`
- `releaseScope`
- `freePlanConfigured`, `freeConfigured`, or `plans.free.enabled`
- `proPlanConfigured`, `proConfigured`, or `plans.pro.enabled`
- `businessPlanStatus`, `businessPurchasable`, or `plans.business.purchasable`
- `planChangeSyncReady`, `planChangeReflectionReady`, or `planChangeReflection.status`
- `limitDecisionReady`, `freeLimitDecisionReady`, `proPermissionDecisionReady`, or `limitDecision.status`
- `authReady`, `authenticationReady`, or `ready`
- `persistenceReady`, `databaseBackedPersistenceReady`, `d1Reachable`, or `databaseReady`
- `deployStatus` or `latestDeployStatus`
- `primaryErrorCategories` or `errorCategories`

The app contracts remain owned by `professional-platform-contracts`; Platform Admin only normalizes the release-readiness snapshot for monitoring.

## CI Guardrail

`scripts/verify-plan-readiness.mjs` validates the production `/api/plan-readiness` payload after deploy. It checks that Numeria Studio, Velvet, AI Platform Core, Feedback Hub, and Growth Engine are present, each required readiness item is reported with `success`, `warning`, `error`, or `skipped`, and forbidden sensitive field names are not included in the monitoring payload.
